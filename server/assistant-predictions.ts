import { invokeLLM } from "./_core/llm";
import { listManagerDecisionPatterns } from "./assistant-learning-service";
import { buildManagerPreferenceProfile } from "./assistant-preferences";
import { ASSISTANT_DATA_SCOPE, FORBIDDEN_AUTOMATION_ACTIONS, type AssistantDataScopeKey } from "./assistant-data-scope";
import { suggestAutomationMode } from "./assistant-auto-approval";

export type PredictionResult = {
  summary: string;
  forecasts: Array<{ label: string; value: string; confidence: number; horizon: string; rationale: string }>;
  rankedOptions: Array<{ option: string; score: number; rationale: string; sources: string[] }>;
  autoApproval: { eligible: boolean; reason: string; actionType: string };
  automationSuggestion: { suggested: boolean; mode: "disabled" | "partial" | "full"; reason: string };
};

const FORBIDDEN_AUTO_ACTIONS = new Set<string>(FORBIDDEN_AUTOMATION_ACTIONS);

export async function predictForManager(input: { assistant: string; taskSnapshot: string; actionType?: string }): Promise<PredictionResult> {
  const patterns = await listManagerDecisionPatterns({ assistant: input.assistant, limit: 20 });
  const preferenceProfile = await buildManagerPreferenceProfile({ assistant: input.assistant });
  const safeSnapshot = input.taskSnapshot.trim().slice(0, 9000);
  const patternSummary = patterns.map(row => row.metadata).filter(Boolean).join("\n").slice(0, 3000);
  const scope = ASSISTANT_DATA_SCOPE[input.assistant as AssistantDataScopeKey];
  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: `أنت مساعد تحليلي إداري. أخرج JSON مطابقاً للمخطط فقط. لا تدّعي اليقين ولا تستنتج قراراً وظيفياً. اعتبر البيانات الواردة سجلاً محدوداً، واذكر انخفاض الثقة عند نقص البيانات. لا تمنح الموافقة الآلية على الجزاءات أو القرارات الوظيفية أو المراسلات الحساسة أو تغيير الصلاحيات. مصادر هذا المساعد المسموح بها: ${scope.sources.join("، ")}. البيانات المحظورة: ${scope.restricted.join("، ")}.` },
      { role: "user", content: `المساعد: ${input.assistant}\nنوع الإجراء المطلوب تقييمه: ${input.actionType ?? "غير محدد"}\nملخص المهام المصرح به: ${safeSnapshot}\nأنماط قرارات مديرين سابقة مختصرة، للاستئناس لا للنسخ: ${patternSummary || "لا توجد أنماط كافية."}\nملف تفضيلات إحصائي قابل للمراجعة: ${JSON.stringify(preferenceProfile)}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "rakiza_manager_prediction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            forecasts: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" }, confidence: { type: "number" }, horizon: { type: "string" }, rationale: { type: "string" } }, required: ["label", "value", "confidence", "horizon", "rationale"], additionalProperties: false } },
            rankedOptions: { type: "array", items: { type: "object", properties: { option: { type: "string" }, score: { type: "number" }, rationale: { type: "string" }, sources: { type: "array", items: { type: "string" } } }, required: ["option", "score", "rationale", "sources"], additionalProperties: false } },
            autoApproval: { type: "object", properties: { eligible: { type: "boolean" }, reason: { type: "string" }, actionType: { type: "string" } }, required: ["eligible", "reason", "actionType"], additionalProperties: false },
          },
          required: ["summary", "forecasts", "rankedOptions", "autoApproval"],
          additionalProperties: false,
        },
      },
    },
    reasoning: { effort: "low" },
    maxTokens: 1800,
  });
  const content = response.choices?.[0]?.message?.content;
  const parsed = JSON.parse(typeof content === "string" ? content : "{}");
  const result = parsed as PredictionResult;
  const forcedIneligible = input.actionType ? FORBIDDEN_AUTO_ACTIONS.has(input.actionType) : false;
  const automationSuggestion = suggestAutomationMode({ actionType: input.actionType ?? "priority", confidence: Math.max(0, Math.min(1, Number(result.forecasts?.[0]?.confidence) || 0)), sampleSize: preferenceProfile.sampleSize });
  return {
    ...result,
    forecasts: (result.forecasts ?? []).map(item => ({ ...item, confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)) })),
    rankedOptions: (result.rankedOptions ?? []).map(item => ({ ...item, score: Math.max(0, Math.min(100, Number(item.score) || 0)), sources: Array.isArray(item.sources) ? item.sources.slice(0, 8) : [] })),
    autoApproval: forcedIneligible ? { eligible: false, reason: "هذا النوع من الإجراءات محظور من الموافقة الآلية ويتطلب اعتماداً بشرياً.", actionType: input.actionType! } : { ...result.autoApproval, eligible: Boolean(result.autoApproval?.eligible), actionType: input.actionType ?? result.autoApproval?.actionType ?? "غير محدد" },
    automationSuggestion,
  };
}
