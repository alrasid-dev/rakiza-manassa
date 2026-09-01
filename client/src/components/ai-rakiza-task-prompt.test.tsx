import { describe, expect, it } from "vitest";
import { buildAiRakizaContexts, nextAiRakizaTask } from "./AiRakizaTaskPrompt";

describe("AI ركيزة وتنبيه بدء المهمة", () => {
  it("يعرض أقرب مهمة بدأت فعلياً فقط", () => {
    expect(nextAiRakizaTask([
      { id: 1, title: "مهمة مكتملة", status: "completed", dueAt: "2026-08-28T07:00:00.000Z" },
      { id: 2, title: "متابعة لاحقة", status: "new", dueAt: "2026-08-28T10:00:00.000Z" },
      { id: 3, title: "متابعة قيد التنفيذ", status: "in_progress", dueAt: "2026-08-28T08:00:00.000Z" },
    ])).toMatchObject({ id: 3, title: "متابعة قيد التنفيذ" });
  });

  it("لا يعرض نافذة عند عدم وجود مهمة بدأت", () => {
    expect(nextAiRakizaTask([{ id: 1, title: "جديدة", status: "new" }, { id: 2, title: "متأخرة لم تبدأ", status: "overdue" }])).toBeNull();
  });

  it("يعرض سياق البريد والتنبيهات للمتابعة ولا ينشئ أي إجراء تلقائي", () => {
    expect(buildAiRakizaContexts({ tasks: [], unreadMailCount: 2, unreadNotificationCount: 1 })).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "mail", actionLabel: "فتح البريد" }), expect.objectContaining({ kind: "notification", actionLabel: "فتح التنبيهات" })]));
  });

  it("يعرض البريد العاجل قبل المهمة الجارية ولا يخلطه مع البريد العادي", () => {
    const contexts = buildAiRakizaContexts({ tasks: [{ id: 1, title: "مهمة جارية", status: "in_progress" }], unreadMailCount: 3, urgentUnreadMailCount: 1 });
    expect(contexts.map(item => item.kind)).toEqual(["mail", "task", "mail"]);
    expect(contexts[0].title).toContain("عاجلة");
    expect(contexts[2].title).toContain("2 رسالة");
  });
});
