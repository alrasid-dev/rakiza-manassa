import { describe, expect, it } from "vitest";
import { evaluateAutoApproval } from "./assistant-auto-approval";

describe("بوابة الموافقة الآلية", () => {
  it("تظل معطلة افتراضياً", () => {
    const result = evaluateAutoApproval({ actionType: "priority", confidence: 1, sampleSize: 20 });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("غير مفعلة");
  });

  it("تحظر القرارات الحساسة حتى مع الثقة العالية", () => {
    const result = evaluateAutoApproval({ actionType: "penalty", confidence: 1, sampleSize: 100, policy: { mode: "full", minConfidence: 0.9, minSampleSize: 5, allowedActions: ["priority", "penalty"] } });
    expect(result.eligible).toBe(false);
    expect(result.requiresHumanApproval).toBe(true);
  });

  it("تقبل إجراء منخفض المخاطر فقط بعد اجتياز الحدود", () => {
    const result = evaluateAutoApproval({ actionType: "priority", confidence: 0.95, sampleSize: 8, policy: { mode: "full", minConfidence: 0.9, minSampleSize: 5, allowedActions: ["priority"] } });
    expect(result.eligible).toBe(true);
    expect(result.requiresHumanApproval).toBe(false);
  });
});
