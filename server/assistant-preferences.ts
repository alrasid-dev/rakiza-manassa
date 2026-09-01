import { listManagerDecisionPatterns } from "./assistant-learning-service";

type DecisionMetadata = { assistant?: string; decisionType?: string; decision?: "accepted" | "rejected" | "modified" };

export async function buildManagerPreferenceProfile(input: { assistant: string }) {
  const rows = await listManagerDecisionPatterns({ assistant: input.assistant, limit: 100 });
  const counts = { accepted: 0, rejected: 0, modified: 0 };
  const byDecisionType: Record<string, number> = {};
  for (const row of rows) {
    try {
      const metadata = JSON.parse(row.metadata ?? "{}") as DecisionMetadata;
      if (metadata.decision && metadata.decision in counts) counts[metadata.decision] += 1;
      if (metadata.decisionType) byDecisionType[metadata.decisionType] = (byDecisionType[metadata.decisionType] ?? 0) + 1;
    } catch { /* سجل قديم غير قابل للتحليل، لا يؤثر في التشغيل */ }
  }
  const total = counts.accepted + counts.rejected + counts.modified;
  return {
    sampleSize: total,
    acceptanceRate: total ? Number((counts.accepted / total).toFixed(2)) : null,
    modificationRate: total ? Number((counts.modified / total).toFixed(2)) : null,
    decisionCounts: counts,
    decisionTypeCounts: byDecisionType,
    caveat: "هذا ملخص إحصائي للاستئناس فقط، ولا يمثل قاعدة ملزمة أو قراراً تلقائياً.",
  };
}
