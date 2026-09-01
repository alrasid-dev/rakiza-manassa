import { describe, expect, it } from "vitest";
import { dashboardCompletionMotionClass, dashboardDeadlineBadge, dashboardMetricIconSlotClass, dashboardPriorityBadge, dashboardTaskMatchesFilter, dashboardTaskVisualState, formatUnreadBadgeCount, newlyCompletedDashboardTaskIds, profileInitials, stateLabel, stateTone, teamStatusLabel } from "./Home";

describe("دلالة حالة مهام لوحة القيادة", () => {
  it("يستخدم اللون الأخضر والعبارة الآمنة عندما لا يوجد تأخر أو استحقاق قريب", () => {
    expect(stateTone(0, 0)).toContain("e2eee3");
    expect(stateLabel(0, 0)).toBe("ضمن المسار");
  });

  it("يستخدم الأصفر لقرب الاستحقاق قبل بدء التأخر", () => {
    expect(stateTone(0, 2)).toContain("f5edd8");
    expect(stateLabel(0, 2)).toBe("قريب الاستحقاق");
  });

  it("يستخدم الأحمر عند وجود مهمة متأخرة", () => {
    expect(stateTone(1, 0)).toContain("f8e6e1");
    expect(stateLabel(1, 0)).toBe("يحتاج تدخلاً");
  });
});

describe("مرشح مهام لوحة القيادة", () => {
  const now = Date.parse("2026-08-25T12:00:00Z");
  const overdue = { id: 1, title: "متأخرة", status: "in_progress", dueAt: "2026-08-25T11:00:00Z" };
  const dueSoon = { id: 2, title: "قريبة", status: "new", dueAt: "2026-08-25T20:00:00Z" };
  const completed = { id: 3, title: "مكتملة", status: "completed", dueAt: "2026-08-20T10:00:00Z" };

  it("يطابق كل مهمة مع الحالة اللونية الصحيحة", () => {
    expect(dashboardTaskVisualState(overdue, now)).toBe("overdue");
    expect(dashboardTaskVisualState(dueSoon, now)).toBe("due_soon");
    expect(dashboardTaskVisualState(completed, now)).toBe("completed");
  });

  it("يعرض المهام المطابقة للمرشح فقط", () => {
    expect(dashboardTaskMatchesFilter(overdue, "overdue", now)).toBe(true);
    expect(dashboardTaskMatchesFilter(dueSoon, "overdue", now)).toBe(false);
    expect(dashboardTaskMatchesFilter(completed, "completed", now)).toBe(true);
  });
});

describe("شارة التواصل غير المقروء", () => {
  it("يعرض العدد الحقيقي ويخفي القيم السالبة", () => {
    expect(formatUnreadBadgeCount(4)).toBe("4");
    expect(formatUnreadBadgeCount(-1)).toBe("0");
  });

  it("يختصر الأعداد الكبيرة إلى 99+", () => {
    expect(formatUnreadBadgeCount(100)).toBe("99+");
  });
});

describe("شارات الأولوية والموعد في لوحة المهام", () => {
  const now = Date.parse("2026-08-25T12:00:00Z");

  it("يميز الأولوية العادية والعالية والحرجة بألوان وتسميات واضحة", () => {
    expect(dashboardPriorityBadge("normal").label).toBe("عادية");
    expect(dashboardPriorityBadge("high").className).toContain("f5edd8");
    expect(dashboardPriorityBadge("critical").label).toBe("حرجة");
  });

  it("يميز التأخر وقرب الموعد ضمن الشارة الزمنية", () => {
    expect(dashboardDeadlineBadge({ id: 10, title: "متأخرة", status: "in_progress", dueAt: "2026-08-25T11:00:00Z" }, now).label).toBe("متأخرة");
    expect(dashboardDeadlineBadge({ id: 11, title: "قريبة", status: "new", dueAt: new Date(now + 2 * 60 * 60 * 1000) }, now).label).toBe("قريبة الموعد");
  });

  it("يرصد المهمة التي تغيرت فعلياً إلى مكتملة لبدء انتقال الشارة مرة واحدة", () => {
    const previousStatuses = new Map([[20, "in_progress"], [21, "completed"]]);
    const tasks = [
      { id: 20, title: "انتقلت إلى مكتملة", status: "completed", dueAt: "2026-08-25T11:00:00Z" },
      { id: 21, title: "مكتملة سابقاً", status: "completed", dueAt: "2026-08-25T11:00:00Z" },
    ];
    expect(newlyCompletedDashboardTaskIds(tasks, previousStatuses)).toEqual([20]);
  });

  it("يطبّق حركة قصيرة مع إيقافها عند تفضيل تقليل الحركة", () => {
    expect(dashboardCompletionMotionClass(true)).toContain("motion-safe:animate-in");
    expect(dashboardCompletionMotionClass(true)).toContain("motion-reduce:animate-none");
    expect(dashboardCompletionMotionClass(false)).toBe("");
  });
});

describe("معاينة الفريق في لوحة القيادة", () => {
  it("يستخرج اختصاراً مقروءاً من الاسم ولا يترك الصورة الرمزية فارغة", () => {
    expect(profileInitials("عبدالعزيز محمد العتيبي")).toBe("عم");
    expect(profileInitials("  ")).toBe("ف");
  });

  it("يستخدم تسميات عربية واضحة لحالات أعضاء الفريق", () => {
    expect(teamStatusLabel("active")).toBe("نشط");
    expect(teamStatusLabel("on_leave")).toBe("في إجازة");
    expect(teamStatusLabel("pending_review")).toBe("قيد المراجعة");
  });
});

describe("حاوية أيقونات مؤشرات لوحة القيادة", () => {
  it("تحافظ على حجم ثابت وحد فاصل وخلفية متناسبة مع لون الحالة", () => {
    expect(dashboardMetricIconSlotClass).toContain("h-8 w-8");
    expect(dashboardMetricIconSlotClass).toContain("border-current/15");
    expect(dashboardMetricIconSlotClass).toContain("bg-current/10");
  });
});
