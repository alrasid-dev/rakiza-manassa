import { describe, expect, it } from "vitest";
import { completedTaskTransition, taskAssignmentNotification, taskAssignmentNotifications, taskCopyNotification } from "./task-response-policy";

describe("تفاعل المكلف مع المهمة", () => {
  it("ينشئ إشعار إسناد مباشر بمعرف يمنع التكرار", () => {
    const notification = taskAssignmentNotification(41, "اعتماد صك حكم");
    expect(notification.dedupeKey).toBe("direct-task-assigned-41");
    expect(notification.body).toContain("اعتماد صك حكم");
  });
  it("يميّز إشعار نسخة التنبيه عن إشعار المكلف الأصلي", () => {
    const notification = taskCopyNotification(41, "اعتماد صك حكم", 22);
    expect(notification.dedupeKey).toBe("task-copy-41-22");
    expect(notification.title).toContain("نسخة تنبيه");
    expect(notification.body).toContain("لا يعني ذلك تكليفك");
  });
  it("يمرر نسخة التنبيه إلى إشعار مستقل بجانب إشعار المكلف الأساسي", () => {
    expect(taskAssignmentNotifications({ taskId: 41, title: "اعتماد صك حكم", assigneeProfileId: 10, traineeCopyProfileId: 22 })).toEqual([
      expect.objectContaining({ profileId: 10, dedupeKey: "direct-task-assigned-41" }),
      expect.objectContaining({ profileId: 22, dedupeKey: "task-copy-41-22", title: "نسخة تنبيه على مهمة تشغيلية" }),
    ]);
    expect(taskAssignmentNotifications({ taskId: 41, title: "اعتماد صك حكم", assigneeProfileId: 10, traineeCopyProfileId: 10 })).toHaveLength(1);
  });
  it("ينقل تمت المعالجة إلى تحت المراجعة", () => {
    expect(completedTaskTransition()).toMatchObject({ status: "under_review", updateType: "submitted" });
  });
});
