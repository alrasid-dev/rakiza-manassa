import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTask: vi.fn(async () => 833),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getEffectiveRoles: vi.fn(async () => ["court_president"]),
    createTask: mocks.createTask,
  };
});

import { courtRouter } from "./routers/court";

describe("court.tasks.create", () => {
  it("يسمح لمالك المنصة ذي التحكم الكامل بإنشاء مهمة دون دور قيادي إضافي", async () => {
    mocks.createTask.mockClear();
    const caller = courtRouter.createCaller({
      user: { id: 9, role: "user", email: "rakizaplatform@gmail.com", name: "مالك رَكيزة", openId: "owner" },
    } as never);

    await caller.tasks.create({
      title: "مهمة اختبار مالك المنصة",
      priority: "high",
      assigneeProfileId: 10,
      scheduledFor: new Date("2026-08-14T07:00:00.000Z"),
      dueAt: new Date("2026-08-14T13:00:00.000Z"),
    });

    expect(mocks.createTask).toHaveBeenCalledWith(expect.objectContaining({
      title: "مهمة اختبار مالك المنصة",
      assigneeProfileId: 10,
      assignedByUserId: 9,
    }));
  });

  it("يمرر traineeCopyProfileId الوارد من الإدخال إلى خدمة إنشاء المهمة", async () => {
    const caller = courtRouter.createCaller({
      user: { id: 1, role: "admin", email: "owner@court.example", name: "مالك المنصة", openId: "owner" },
    } as never);

    await caller.tasks.create({
      title: "مهمة اختبار نسخة تنبيه",
      priority: "normal",
      assigneeProfileId: 10,
      traineeCopyProfileId: 22,
      scheduledFor: new Date("2026-08-14T07:00:00.000Z"),
      dueAt: new Date("2026-08-14T13:00:00.000Z"),
    });

    expect(mocks.createTask).toHaveBeenCalledWith(expect.objectContaining({
      assigneeProfileId: 10,
      traineeCopyProfileId: 22,
      assignedByUserId: 1,
    }));
  });
});
