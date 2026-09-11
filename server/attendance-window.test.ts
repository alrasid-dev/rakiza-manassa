import { describe, expect, it } from "vitest";
import { attendanceWindowKindForShift } from "./court-service";
import { BASE_FLEX3_SHIFT } from "./attendance-balance";

const shift = {
  workingDays: BASE_FLEX3_SHIFT.workingDays,
  fingerprintOpenMinutes: BASE_FLEX3_SHIFT.fingerprintOpenMinutes,
  morningCompensationDeadlineMinutes: BASE_FLEX3_SHIFT.morningCompensationDeadlineMinutes,
  actualEndMinutes: BASE_FLEX3_SHIFT.actualEndMinutes,
  fingerprintCloseMinutes: BASE_FLEX3_SHIFT.fingerprintCloseMinutes,
};

describe("نافذة الحضور والانصراف بحسب الوردية", () => {
  it("تظهر الحضور من 07:00 والانصراف من 14:15 بتوقيت الرياض", () => {
    expect(attendanceWindowKindForShift(shift, new Date("2026-09-13T04:00:00.000Z"))).toBe("check_in");
    expect(attendanceWindowKindForShift(shift, new Date("2026-09-13T11:15:00.000Z"))).toBe("check_out");
  });

  it("لا تظهر خارج نافذة الوردية أو في يوم غير عامل", () => {
    expect(attendanceWindowKindForShift(shift, new Date("2026-09-13T08:00:00.000Z"))).toBe("none");
    expect(attendanceWindowKindForShift(shift, new Date("2026-09-12T04:00:00.000Z"))).toBe("none");
  });
});
