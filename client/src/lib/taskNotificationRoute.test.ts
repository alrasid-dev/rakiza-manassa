import { describe, expect, it } from "vitest";
import { taskIdFromNotificationDedupeKey } from "./taskNotificationRoute";

describe("مسار إشعار المهمة", () => {
  it("يستخرج المهمة من إشعار الإسناد ونسخة التنبيه فقط", () => {
    expect(taskIdFromNotificationDedupeKey("direct-task-assigned-41")).toBe(41);
    expect(taskIdFromNotificationDedupeKey("task-copy-41-22")).toBe(41);
    expect(taskIdFromNotificationDedupeKey("correspondence-copy-41-22-trainee_copy")).toBeNull();
    expect(taskIdFromNotificationDedupeKey(null)).toBeNull();
  });
});
