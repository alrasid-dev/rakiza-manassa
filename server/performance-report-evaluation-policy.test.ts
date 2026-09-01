import { describe, expect, it } from "vitest";
import { buildReportEvaluationProposal, reportPeriodWorkingDays } from "./performance-report-evaluation-policy";

describe("مقياس تقييم تقرير الأداء", () => {
  it("يطبع الإنجاز على أيام العمل المكافئة بدلاً من العد الخام بين اليوم والأسبوع والشهر", () => {
    expect(reportPeriodWorkingDays("daily")).toBe(1);
    expect(reportPeriodWorkingDays("weekly")).toBe(5);
    expect(reportPeriodWorkingDays("monthly")).toBe(22);
    expect(buildReportEvaluationProposal({ period: "daily", analysisStatus: "readable", extractedCompletedCount: 5, extractedIssueCount: 0, confidence: 100 })).toMatchObject({ periodDays: 1, normalizedDailyRateHundredths: 500, suggestedPoints: 5 });
    expect(buildReportEvaluationProposal({ period: "weekly", analysisStatus: "readable", extractedCompletedCount: 25, extractedIssueCount: 0, confidence: 100 })).toMatchObject({ periodDays: 5, normalizedDailyRateHundredths: 500, suggestedPoints: 5 });
  });

  it("لا يقترح أي نقاط لملف ZIP أو ملف غير قابل للقراءة حتى يراجعه مدير بشري", () => {
    expect(buildReportEvaluationProposal({ period: "monthly", analysisStatus: "unreadable", extractedCompletedCount: 50, extractedIssueCount: 0, confidence: 90 }).suggestedPoints).toBeNull();
    expect(buildReportEvaluationProposal({ period: "weekly", analysisStatus: "not_attempted", extractedCompletedCount: null, extractedIssueCount: null, confidence: null }).normalizedDailyRateHundredths).toBeNull();
  });
});
