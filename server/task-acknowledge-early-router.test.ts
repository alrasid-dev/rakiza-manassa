import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTaskById: vi.fn(async () => ({ id: 81, assigneeProfileId: 4, scheduledFor: new Date("2099-01-01T07:00:00.000Z"), status: "new" })),
  getProfileForUser: vi.fn(async () => ({ id: 4, userId: 9, fullName: "موظف مكلف", personType: "administrative", unitId: 2, status: "active" })),
  rolesForUser: vi.fn(async () => []),
  acknowledgeTask: vi.fn(async () => ({ success: true, status: "in_progress" as const, earlyStartRewarded: true })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getTaskById: mocks.getTaskById, getProfileForUser: mocks.getProfileForUser, rolesForUser: mocks.rolesForUser, acknowledgeTask: mocks.acknowledgeTask };
});

import { courtRouter } from "./routers/court";

describe("court.tasks.acknowledge", () => {
  it("يسمح للمكلف ببدء مهمة مجدولة لاحقاً ويسجل البدء عبر الخدمة", async () => {
    const caller = courtRouter.createCaller({ user: { id: 9, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);

    await expect(caller.tasks.acknowledge({ taskId: 81 })).resolves.toEqual({ success: true, status: "in_progress", earlyStartRewarded: true });
    expect(mocks.acknowledgeTask).toHaveBeenCalledWith({ taskId: 81, actorUserId: 9, profileId: 4, scheduledFor: new Date("2099-01-01T07:00:00.000Z") });
  });
});
