import { describe, expect, it } from "vitest";
import { BASE_FLEX3_SHIFT, earlyCheckoutDeficitMinutes, saudiLocalMinutes } from "./attendance-balance";
import { attendanceWindowKindForShift } from "./court-service";

describe("رصيد الانصراف والوردية الأساسية", () => {
  it("لا تحتسب الدقائق بين 14:15 و14:30 كرصيد سالب", () => {
    // 14:15 Riyadh = 11:15 UTC
    expect(earlyCheckoutDeficitMinutes({ checkOutAt: new Date("2026-09-13T11:15:00.000Z"), actualEndMinutes: BASE_FLEX3_SHIFT.actualEndMinutes, endMinutes: BASE_FLEX3_SHIFT.endMinutes })).toBe(0);
    expect(earlyCheckoutDeficitMinutes({ checkOutAt: new Date("2026-09-13T11:30:00.000Z"), actualEndMinutes: BASE_FLEX3_SHIFT.actualEndMinutes, endMinutes: BASE_FLEX3_SHIFT.endMinutes })).toBe(0);
    // 14:00 Riyadh = 11:00 UTC → 30 دقيقة مبكر عن 14:30
    expect(earlyCheckoutDeficitMinutes({ checkOutAt: new Date("2026-09-13T11:00:00.000Z"), actualEndMinutes: BASE_FLEX3_SHIFT.actualEndMinutes, endMinutes: BASE_FLEX3_SHIFT.endMinutes })).toBe(30);
  });

  it("تفتح نافذة الحضور من 07:00 والانصراف من 14:15 بتوقيت الرياض", () => {
    expect(saudiLocalMinutes(new Date("2026-09-13T04:00:00.000Z"))).toBe(420);
    expect(attendanceWindowKindForShift(BASE_FLEX3_SHIFT, new Date("2026-09-13T04:00:00.000Z"))).toBe("check_in");
    expect(attendanceWindowKindForShift(BASE_FLEX3_SHIFT, new Date("2026-09-13T04:30:00.000Z"))).toBe("check_in");
    expect(attendanceWindowKindForShift(BASE_FLEX3_SHIFT, new Date("2026-09-13T11:15:00.000Z"))).toBe("check_out");
    expect(attendanceWindowKindForShift(BASE_FLEX3_SHIFT, new Date("2026-09-13T11:30:00.000Z"))).toBe("check_out");
    expect(attendanceWindowKindForShift(BASE_FLEX3_SHIFT, new Date("2026-09-13T08:00:00.000Z"))).toBe("none");
  });
});
