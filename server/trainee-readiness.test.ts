import { describe, expect, it } from "vitest";
import { addDays, assessTransferReadiness, isDueWithinSevenDays } from "./trainee-readiness";

describe("حالة انتقال الملازم", () => {
  it("يعد الملازم جاهزاً للانتقال عند ثبوت المدة وإقفال المهام والمتعثرات", () => {
    expect(assessTransferReadiness({ expectedEndAt: new Date("2026-09-01T00:00:00Z"), openDelayCount: 0, incompleteTaskCount: 0 })).toEqual({ state: "ready", reasons: [] });
  });

  it("يمنع الانتقال عند وجود متعثرات أو مهام غير مكتملة", () => {
    const result = assessTransferReadiness({ expectedEndAt: new Date("2026-09-01T00:00:00Z"), openDelayCount: 2, incompleteTaskCount: 1 });
    expect(result.state).toBe("not_ready");
    expect(result.reasons).toHaveLength(2);
  });

  it("يمنع الجاهزية عندما لا يثبت تاريخ نهاية الملازمة", () => {
    expect(assessTransferReadiness({ expectedEndAt: null, openDelayCount: 0, incompleteTaskCount: 0 }).state).toBe("not_ready");
  });

  it("يتعرف على التنبيه قبل سبعة أيام ويحسب تجديد الستين يوماً", () => {
    const now = new Date("2026-08-14T00:00:00Z");
    expect(isDueWithinSevenDays(new Date("2026-08-21T00:00:00Z"), now)).toBe(true);
    expect(isDueWithinSevenDays(new Date("2026-08-22T00:00:00Z"), now)).toBe(false);
    expect(isDueWithinSevenDays(new Date("2026-08-13T23:59:59Z"), now)).toBe(false);
    expect(addDays(now, 60).toISOString()).toBe("2026-10-13T00:00:00.000Z");
  });
});
