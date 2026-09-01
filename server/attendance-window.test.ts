import { describe, expect, it } from "vitest";
import { attendanceWindowKindForShift } from "./court-service";

const shift = {
  workingDays: "0,1,2,3,4",
  fingerprintOpenMinutes: 420,
  morningCompensationDeadlineMinutes: 570,
  actualEndMinutes: 840,
  fingerprintCloseMinutes: 960,
};

describe("نافذة الحضور والانصراف بحسب الوردية", () => {
  it("تظهر الحضور في نافذة الصباح والانصراف في نهاية الوردية فقط", () => {
    expect(attendanceWindowKindForShift(shift, new Date("2026-08-30T04:30:00.000Z"))).toBe("check_in");
    expect(attendanceWindowKindForShift(shift, new Date("2026-08-30T12:30:00.000Z"))).toBe("check_out");
  });

  it("لا تظهر خارج نافذة الوردية أو في يوم غير عامل", () => {
    expect(attendanceWindowKindForShift(shift, new Date("2026-08-30T08:00:00.000Z"))).toBe("none");
    expect(attendanceWindowKindForShift(shift, new Date("2026-08-28T04:30:00.000Z"))).toBe("none");
  });
});
