import { describe, expect, it } from "vitest";
import {
  attendanceConfirmationCadence,
  attendanceConfirmationDeadline,
  shouldRequestAttendanceConfirmation,
} from "./attendance-confirmation-policy";

describe("سياسة تأكيد الحضور", () => {
  it("تبدأ كل يومين ثم تتدرج مع الانضباط", () => {
    expect(attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: 0, ignoredRecentConfirmations: 0 })).toBe("every_two_days");
    expect(attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: 8, ignoredRecentConfirmations: 0 })).toBe("weekly");
    expect(attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: 20, ignoredRecentConfirmations: 0 })).toBe("biweekly");
    expect(attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: 40, ignoredRecentConfirmations: 0 })).toBe("monthly");
  });

  it("يعيد الطلب إلى كل يومين عند التجاهل ويوقف السياسة عند تعطيلها", () => {
    expect(attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: 40, ignoredRecentConfirmations: 1 })).toBe("every_two_days");
    expect(attendanceConfirmationCadence({ enabled: false, consecutiveConfirmedDays: 40, ignoredRecentConfirmations: 0 })).toBe("disabled");
  });

  it("يحدد مهلة التأكيد ويمنع التكرار قبل انتهاء الفترة", () => {
    const start = new Date("2026-08-20T07:00:00Z");
    expect(attendanceConfirmationDeadline(start).toISOString()).toBe("2026-08-20T07:20:00.000Z");
    expect(shouldRequestAttendanceConfirmation({ enabled: true, lastRequestedAt: start, now: new Date("2026-08-21T07:00:00Z"), cadence: "every_two_days" })).toBe(false);
    expect(shouldRequestAttendanceConfirmation({ enabled: true, lastRequestedAt: start, now: new Date("2026-08-22T07:00:00Z"), cadence: "every_two_days" })).toBe(true);
  });
});
