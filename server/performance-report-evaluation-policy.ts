export type ReportPeriod = "daily" | "weekly" | "monthly";
export type ReportAnalysisStatus = "readable" | "partial" | "unreadable" | "not_attempted";

/** أيام العمل المكافئة، لا الأيام التقويمية، لتجنب مقارنة العد الخام بين الفترات. */
export function reportPeriodWorkingDays(period: ReportPeriod) {
  return period === "daily" ? 1 : period === "weekly" ? 5 : 22;
}

export function buildReportEvaluationProposal(input: { period: ReportPeriod; analysisStatus: ReportAnalysisStatus; extractedCompletedCount: number | null; extractedIssueCount: number | null; confidence: number | null }) {
  const periodDays = reportPeriodWorkingDays(input.period);
  const completedCount = Math.max(0, input.extractedCompletedCount ?? 0);
  const issueCount = Math.max(0, input.extractedIssueCount ?? 0);
  const confidence = Math.max(0, Math.min(100, input.confidence ?? 0));
  const readable = input.analysisStatus === "readable" || input.analysisStatus === "partial";
  const normalizedDailyRateHundredths = readable ? Math.round((completedCount / periodDays) * 100) : null;
  // الاقتراح للمراجعة فقط؛ الجودة/الثقة تخفضه ولا يمكن أن تنشئ نقاطاً تلقائياً.
  const suggestedPoints = readable && confidence >= 50 && normalizedDailyRateHundredths !== null
    ? Math.max(0, Math.min(10, Math.round((normalizedDailyRateHundredths / 100) * (confidence / 100) - Math.min(2, issueCount * 0.25))))
    : null;
  return { periodDays, normalizedDailyRateHundredths, suggestedPoints };
}
