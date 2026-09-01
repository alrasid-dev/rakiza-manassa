import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDashboardSummary: vi.fn(async () => ({ roles: ["court_president"], profiles: 16, templates: 7, openDelays: 2, overdueDelays: 1, dueTasks: 4, announcements: [] })),
  getPersonalDashboard: vi.fn(async () => ({ openTasks: 3, overdueTasks: 1, openDelays: 2, unreadNotifications: 4 })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getDashboardSummary: mocks.getDashboardSummary,
    getPersonalDashboard: mocks.getPersonalDashboard,
    getAccessPermission: vi.fn(async (email: string | null) => email === "employee@court.example" ? "employee" : "general_view"),
    getEffectiveRoles: vi.fn(async () => []),
    getProfileForUser: vi.fn(async () => ({ id: 9, fullName: "موظف إداري", personType: "administrative", unitId: 1 })),
  };
});

import { courtRouter } from "./routers/court";

describe("نطاق لوحة القيادة", () => {
  it("يعيد ملخص القيادة لحساب المالك دون الاعتماد على ملف شخصي", async () => {
    const owner = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "المالك", openId: "owner" } } as never);
    await expect(owner.dashboard()).resolves.toMatchObject({ templates: 7, profiles: 16, dueTasks: 4 });
    expect(mocks.getDashboardSummary).toHaveBeenCalledWith(1, true);
    expect(mocks.getPersonalDashboard).not.toHaveBeenCalled();
  });

  it("يعيد مؤشرات الملف الشخصي للموظف دون كشف ملخص القيادة", async () => {
    const employee = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(employee.dashboard()).resolves.toEqual({ openTasks: 3, overdueTasks: 1, openDelays: 2, unreadNotifications: 4 });
    expect(mocks.getPersonalDashboard).toHaveBeenCalledWith(9);
    expect(mocks.getDashboardSummary).toHaveBeenCalledTimes(1);
  });
});
