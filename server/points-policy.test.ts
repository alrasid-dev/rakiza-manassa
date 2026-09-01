import { describe, expect, it } from "vitest";
import { automaticUnstartedTaskScore, earlyTaskStartScore, newDelayScore, taskApprovalScore } from "./points-policy";

describe("سياسة النقاط", () => {
  it("تمنح نقاطاً إيجابية عند اعتماد إنجاز المهمة", () => {
    expect(taskApprovalScore()).toBeGreaterThan(0);
  });
  it("تسجل نقاطاً سلبية عند فتح متعثر جديد", () => {
    expect(newDelayScore()).toBeLessThan(0);
  });
  it("تطبق الخصم التلقائي نفسه عند عدم بدء المهمة وطلب إعادة إسنادها", () => {
    expect(automaticUnstartedTaskScore()).toBe(newDelayScore());
  });
  it("تمنح مكافأة موجبة عند البدء المبكر للمهمة", () => {
    expect(earlyTaskStartScore()).toBeGreaterThan(0);
  });
});
