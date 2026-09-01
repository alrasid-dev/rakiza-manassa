import { describe, expect, it } from "vitest";
import {
  assignmentBlockReason,
  assignPerformanceTasksByNameOrEvenly,
  attendancePeriodRange,
  deadlineNudgeKind,
  detectContradictions,
  evaluatePerformanceReportIntegrity,
  isDelegationActive,
  isDoNotDisturbActive,
  isValidSaudiPhone,
  matchStaffByName,
  normalizeSaudiPhone,
  notificationMatchesFilter,
  profileCanReceiveNewTask,
  resolveWorkMode,
  scoreSearchHit,
  summarizeAttendanceRecords,
} from "./platform-completion";

describe("صلاحيات الإسناد والإجازة", () => {
  it("يمنع إسناد المهام الجديدة للمجاز أو الموقوف", () => {
    expect(profileCanReceiveNewTask("active")).toBe(true);
    expect(profileCanReceiveNewTask("on_leave")).toBe(false);
    expect(assignmentBlockReason("on_leave")).toMatch(/إجازة/);
    expect(assignmentBlockReason("inactive")).toMatch(/موقوف/);
  });
});

describe("توزيع تقارير مراقبة الأداء", () => {
  it("يسند بالاسم عند وجود تطابق واحد ثم يوزع الباقي بالتساوي", () => {
    const staff = [
      { id: 1, fullName: "محمد عبدالله القحطاني", openWorkload: 2 },
      { id: 2, fullName: "سارة أحمد العتيبي", openWorkload: 0 },
    ];
    const assignments = assignPerformanceTasksByNameOrEvenly(
      [{ title: "متابعة محضر الجلسة لدى محمد عبدالله القحطاني", source: "word" }, { title: "تجهيز كشف الحضور الأسبوعي", source: "excel" }],
      staff,
    );
    expect(assignments[0]).toMatchObject({ assigneeId: 1, matchedByName: true });
    expect(assignments[1]).toMatchObject({ assigneeId: 2, matchedByName: false });
  });

  it("لا يخمن عند تشابه أكثر من اسم", () => {
    expect(matchStaffByName("مهمة محمد", [{ id: 1, fullName: "محمد علي" }, { id: 2, fullName: "محمد سعد" }])).toBeUndefined();
  });
});

describe("حماية التقارير", () => {
  it("يرفض التقرير الناقص والمتناقض والأسماء غير الموجودة", () => {
    const result = evaluatePerformanceReportIntegrity({
      text: "تم إنجاز المعاملة ولم يتم إنجاز المعاملة. الموظف خالد بن وليد الافتراضي",
      staffNames: ["سارة أحمد العتيبي"],
      extractedCount: 0,
    });
    expect(result.accepted).toBe(false);
    expect(result.reasons.some(reason => /ناقص|استخراج/.test(reason))).toBe(true);
    expect(detectContradictions("تم الإنجاز ولم يتم الإنجاز")).toBe(true);
  });
});

describe("الحضور والوقت", () => {
  it("يلخص السجل اليومي والأسبوعي", () => {
    const monday = new Date("2026-08-31T08:00:00Z");
    const records = [
      { status: "present", recordDate: monday },
      { status: "late", recordDate: monday },
      { status: "absent", recordDate: new Date("2026-08-20T08:00:00Z") },
    ];
    const daily = summarizeAttendanceRecords(records, "daily", monday);
    expect(daily.present).toBe(1);
    expect(daily.late).toBe(1);
    expect(daily.absent).toBe(0);
    expect(attendancePeriodRange("monthly", monday).start.getUTCDate()).toBe(1);
  });

  it("ينبه قبل 24 ساعة ثم 12 ساعة", () => {
    const now = new Date("2026-09-01T08:00:00Z");
    expect(deadlineNudgeKind(new Date("2026-09-02T07:00:00Z"), now)).toBe("24h");
    expect(deadlineNudgeKind(new Date("2026-09-01T18:00:00Z"), now)).toBe("12h");
    expect(deadlineNudgeKind(new Date("2026-09-01T07:00:00Z"), now)).toBe("none");
  });
});

describe("التفويض والجوال والإشعارات", () => {
  it("يخفي صلاحية التفويض بعد انتهاء المهمة", () => {
    const now = new Date("2026-09-02T10:00:00Z");
    expect(isDelegationActive({ startsAt: new Date("2026-09-01T00:00:00Z"), endsAt: new Date("2026-09-03T00:00:00Z"), now })).toBe(true);
    expect(isDelegationActive({ startsAt: new Date("2026-09-01T00:00:00Z"), endsAt: new Date("2026-09-02T09:00:00Z"), now })).toBe(false);
  });

  it("يقبل رقم جوال سعودي مجاني كقناة استعادة", () => {
    expect(normalizeSaudiPhone("0501234567")).toBe("+966501234567");
    expect(isValidSaudiPhone("501234567")).toBe(true);
    expect(isValidSaudiPhone("123")).toBe(false);
  });

  it("يصفي الإشعارات ويحترم عدم الإزعاج ووضع الموظف", () => {
    expect(notificationMatchesFilter({ isRead: false, category: "task_due" }, "tasks")).toBe(true);
    expect(notificationMatchesFilter({ isRead: true, category: "task_due" }, "unread")).toBe(false);
    expect(isDoNotDisturbActive(new Date(Date.now() + 60_000).toISOString())).toBe(true);
    expect(resolveWorkMode(true, "employee")).toBe("employee");
    expect(resolveWorkMode(false, "manager")).toBe("employee");
    expect(scoreSearchHit("مهمة", ["متابعة مهمة الحضور", "بريد"])).toBeGreaterThan(0);
  });
});
