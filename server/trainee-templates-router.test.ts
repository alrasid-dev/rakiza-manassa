import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listTaskTemplatesForUnit: vi.fn(async () => [{ id: 31, title: "قالب شؤون الملازمين" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getEffectiveRoles: vi.fn(async () => ["trainee_affairs_manager"]),
    getActiveCourtRoleAssignments: vi.fn(async () => [{ role: "trainee_affairs_manager", unitId: 1 }]),
    listTaskTemplatesForUnit: mocks.listTaskTemplatesForUnit,
  };
});

import { courtRouter } from "./routers/court";

describe("court.trainees.templates", () => {
  it("يعيد قوالب وحدة شؤون الملازمين للمخول بها فقط", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "manager@court.example", name: "مدير", openId: "manager" } } as never);
    await expect(caller.trainees.templates()).resolves.toEqual([{ id: 31, title: "قالب شؤون الملازمين" }]);
    expect(mocks.listTaskTemplatesForUnit).toHaveBeenCalledWith(1);
  });
});
