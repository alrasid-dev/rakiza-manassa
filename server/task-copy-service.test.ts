import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ inserts: [] as Record<string, unknown>[] }));

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    insert: vi.fn(() => ({
      values: vi.fn(async (values: Record<string, unknown>) => {
        state.inserts.push(values);
        return [{ insertId: state.inserts.length === 1 ? 501 : state.inserts.length }];
      }),
    })),
  })),
}));

import { createTask } from "./court-service";

describe("خدمة إنشاء المهمة مع نسخة التنبيه", () => {
  beforeEach(() => { state.inserts.length = 0; });

  it("تستقبل traineeCopyProfileId وتنشئ إشعار المكلف وإشعار نسخة التنبيه الفعليين", async () => {
    await createTask({
      title: "اعتماد صك حكم",
      priority: "high",
      assigneeProfileId: 10,
      traineeCopyProfileId: 22,
      scheduledFor: new Date("2026-08-14T07:00:00.000Z"),
      dueAt: new Date("2026-08-14T13:00:00.000Z"),
      assignedByUserId: 1,
    });

    const notifications = state.inserts.filter(item => item.category === "task_due");
    expect(notifications).toEqual([
      expect.objectContaining({ profileId: 10, dedupeKey: "direct-task-assigned-501", title: "تم إسناد مهمة جديدة" }),
      expect.objectContaining({ profileId: 22, dedupeKey: "task-copy-501-22", title: "نسخة تنبيه على مهمة تشغيلية" }),
    ]);
  });
});
