import { FORBIDDEN_AUTOMATION_ACTIONS } from "./assistant-data-scope";

export const LOW_RISK_AUTO_APPROVAL_ACTIONS = ["summary_ack", "priority"] as const;
export type AutomationMode = "disabled" | "partial" | "full";
export type AutoApprovalPolicy = { mode: AutomationMode; minConfidence: number; minSampleSize: number; allowedActions: readonly string[] };

export const DEFAULT_AUTO_APPROVAL_POLICY: AutoApprovalPolicy = {
  mode: "disabled",
  minConfidence: 0.9,
  minSampleSize: 5,
  allowedActions: LOW_RISK_AUTO_APPROVAL_ACTIONS,
};

export function suggestAutomationMode(input: { confidence: number; sampleSize: number; actionType: string }) {
  const forbidden = (FORBIDDEN_AUTOMATION_ACTIONS as readonly string[]).includes(input.actionType);
  if (forbidden) return { suggested: false, mode: "disabled" as const, reason: "الإجراء حساس ومحظور من الأتمتة." };
  if (input.confidence >= 0.98 && input.sampleSize >= 20) return { suggested: true, mode: "full" as const, reason: "تراكمت عينة كافية وارتفعت الثقة؛ يبقى التفعيل بقرار المدير." };
  if (input.confidence >= 0.9 && input.sampleSize >= 5) return { suggested: true, mode: "partial" as const, reason: "تتوفر مؤشرات أولية؛ يقترح تنفيذ الخطوات الآمنة فقط مع اعتماد الخطوات الحساسة." };
  return { suggested: false, mode: "disabled" as const, reason: "لم تتوفر عينة أو ثقة كافيتان لعرض اقتراح أتمتة." };
}

export function evaluateAutoApproval(input: { actionType: string; confidence: number; sampleSize: number; policy?: AutoApprovalPolicy }) {
  const policy = input.policy ?? DEFAULT_AUTO_APPROVAL_POLICY;
  const forbidden = (FORBIDDEN_AUTOMATION_ACTIONS as readonly string[]).includes(input.actionType);
  if (forbidden) return { eligible: false, mode: "disabled" as const, reason: "الإجراء حساس ومحظور من الموافقة الآلية.", requiresHumanApproval: true };
  if (policy.mode === "disabled") return { eligible: false, mode: policy.mode, reason: "الموافقة الآلية غير مفعلة افتراضياً وتحتاج تفعيلاً صريحاً من مالك القسم.", requiresHumanApproval: true };
  if (!policy.allowedActions.includes(input.actionType)) return { eligible: false, mode: policy.mode, reason: "نوع الإجراء غير موجود في قائمة الإجراءات منخفضة المخاطر.", requiresHumanApproval: true };
  if (input.confidence < policy.minConfidence) return { eligible: false, mode: policy.mode, reason: "درجة الثقة أقل من الحد المحدد.", requiresHumanApproval: true };
  if (input.sampleSize < policy.minSampleSize) return { eligible: false, mode: policy.mode, reason: "عدد قرارات المديرين السابقة غير كافٍ للتفعيل.", requiresHumanApproval: true };
  return { eligible: true, mode: policy.mode, reason: policy.mode === "partial" ? "تنفذ الخطوات منخفضة المخاطر فقط وتحتاج الخطوات الحساسة اعتماداً بشرياً." : "الإجراء منخفض المخاطر واجتاز حدود السياسة، مع تسجيل التنفيذ وإمكانية الإلغاء.", requiresHumanApproval: policy.mode !== "full" };
}
