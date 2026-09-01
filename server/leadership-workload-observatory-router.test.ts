import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEffectiveRoles: vi.fn(async (userId: number, isAdmin: boolean) => isAdmin || userId === 1 ? ["court_president"] : userId === 2 ? ["court_secretary"] : userId === 3 ? ["assistant_president"] : ["department_manager"]),
  getLeadershipWorkloadObservatory: vi.fn(async () => ({ totals: { openTasks: 4 }, units: [], staff: [], recommendations: [] })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getEffectiveRoles: mocks.getEffectiveRoles, getLeadershipWorkloadObservatory: mocks.getLeadershipWorkloadObservatory };
});

import { courtRouter } from "./routers/court";

describe("مسار مرصد الضغط القيادي", () => {
  it("يعيد بيانات القراءة فقط للرئيس والأمين ومساعد الرئيس", async () => {
    for (const [id, role] of [[1, "admin"], [2, "user"], [3, "user"]] as const) {
      const caller = courtRouter.createCaller({ user: { id, role, email: "leader@court.example", name: "قيادي", openId: `leader-${id}` } } as never);
      await expect(caller.leadershipWorkloadObservatory()).resolves.toMatchObject({ totals: { openTasks: 4 }, recommendations: [] });
    }
    expect(mocks.getLeadershipWorkloadObservatory).toHaveBeenCalledTimes(3);
  });

  it("يرفض مدير القسم ولا يمنحه مؤشرات أو توصيات تخص بقية المحكمة", async () => {
    const caller = courtRouter.createCaller({ user: { id: 4, role: "user", email: "manager@court.example", name: "مدير قسم", openId: "manager" } } as never);
    await expect(caller.leadershipWorkloadObservatory()).rejects.toThrow("المالك ورئيس المحكمة والأمين ومساعد الرئيس فقط");
  });
});
