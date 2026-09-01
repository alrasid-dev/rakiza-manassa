import { describe, expect, it } from "vitest";
import { leastLoadedSupportProfile, supportTicketDeadlines, supportTicketStageAt } from "./support-ticket-policy";

describe("سياسة تذاكر الدعم", () => {
  it("يحدد مهلة الموظف 72 ساعة ثم مهلة المدير 24 ساعة", () => {
    const createdAt = new Date("2026-08-14T07:00:00.000Z");
    const deadlines = supportTicketDeadlines(createdAt);
    expect(deadlines.agentDueAt.toISOString()).toBe("2026-08-17T07:00:00.000Z");
    expect(deadlines.managerDueAt.toISOString()).toBe("2026-08-18T07:00:00.000Z");
  });

  it("يوزع التذكرة على أقل موظف دعماً حملاً ثم يحسم التعادل بالمعرف", () => {
    const selected = leastLoadedSupportProfile([{ profile: { id: 7 }, openTicketCount: 2 }, { profile: { id: 3 }, openTicketCount: 1 }, { profile: { id: 2 }, openTicketCount: 1 }]);
    expect(selected?.id).toBe(2);
  });

  it("يصعد إلى المدير ثم الرئيس وفق المرحلتين دون إعادة تصعيد التذكرة المغلقة", () => {
    const now = new Date("2026-08-18T08:00:00.000Z");
    expect(supportTicketStageAt({ status: "in_progress", dueAt: new Date("2026-08-17T07:00:00.000Z"), managerDueAt: null }, now)).toBe("manager");
    expect(supportTicketStageAt({ status: "escalated_to_manager", dueAt: new Date("2026-08-17T07:00:00.000Z"), managerDueAt: new Date("2026-08-18T07:00:00.000Z") }, now)).toBe("president");
    expect(supportTicketStageAt({ status: "resolved", dueAt: new Date("2026-08-17T07:00:00.000Z"), managerDueAt: null }, now)).toBeUndefined();
  });
});
