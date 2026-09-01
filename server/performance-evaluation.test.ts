import { describe, expect, it } from "vitest";
import { evaluatePerformance } from "./performance-evaluation";

describe("مؤشر الأداء الآلي", () => {
  it("يبقى بانتظار بيانات عند عدم وجود أحداث نقاط", () => {
    expect(evaluatePerformance({ positive: 0, negative: 0, balance: 0, positiveEventCount: 0, negativeEventCount: 0 }).tier).toBe("awaiting_data");
  });
  it("يصنف الرصيد الإيجابي المستقر كمتميز وفق عدد الإنجازات", () => {
    expect(evaluatePerformance({ positive: 16, negative: 2, balance: 14, positiveEventCount: 3, negativeEventCount: 1 }).tier).toBe("outstanding");
  });
  it("يرفع مؤشر تدخل عند تراكم أحداث سلبية أو رصيد سلبي مؤثر", () => {
    expect(evaluatePerformance({ positive: 2, negative: 8, balance: -6, positiveEventCount: 1, negativeEventCount: 3 }).tier).toBe("at_risk");
  });
});


describe("حساب مؤشرات الأداء الموزونة", () => {
  it("يحسب الدرجة وفق الأوزان المعتمدة عند اكتمال المؤشرات", async () => {
    const { calculateWeightedPerformance, DEFAULT_PERFORMANCE_WEIGHTS } = await import("./performance-evaluation");
    const result = calculateWeightedPerformance({ attendance: 100, achievement: 80, timeliness: 60, quality: 90, initiatives: 50 });
    expect(result.score).toBe(79.5);
    expect(result.completedMetricCount).toBe(5);
    expect(result.missingMetrics).toEqual([]);
    expect(result.weights).toEqual(DEFAULT_PERFORMANCE_WEIGHTS);
  });

  it("يعلن المؤشرات الناقصة ولا يحول النقص إلى بيانات مكتملة", async () => {
    const { calculateWeightedPerformance } = await import("./performance-evaluation");
    const result = calculateWeightedPerformance({ achievement: 80 });
    expect(result.score).toBe(32);
    expect(result.completedMetricCount).toBe(1);
    expect(result.missingMetrics).toEqual(["attendance", "timeliness", "quality", "initiatives"]);
  });
});
