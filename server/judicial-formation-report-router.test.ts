import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getJudicialFormationReport: vi.fn(async (input: { unitId?: number }) => ({ period: "monthly", formations: [], totals: { judges: 0, trainees: 0, openTasks: 0, overdueTasks: 0, openDelays: 0, ready: 0, notReady: 0 }, receivedUnitId: input.unitId })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getEffectiveRoles: vi.fn(async () => ["department_manager"]),
    getActiveCourtRoleAssignments: vi.fn(async () => [{ role: "department_manager", unitId: 44 }]),
    getJudicialFormationReport: mocks.getJudicialFormationReport,
  };
});

import { courtRouter } from "./routers/court";

describe("court.reports.judicialFormations", () => {
  it("يقصر تقرير التشكيلات على وحدة مدير القسم المفوضة", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "manager@court.example", name: "مدير", openId: "manager" } } as never);
    await expect(caller.reports.judicialFormations({ period: "monthly" })).resolves.toMatchObject({ receivedUnitId: 44 });
    expect(mocks.getJudicialFormationReport).toHaveBeenCalledWith({ period: "monthly", unitId: 44 });
  });

  it("يرفض تقرير تشكيلات لوحدة خارج التفويض", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "manager@court.example", name: "مدير", openId: "manager" } } as never);
    await expect(caller.reports.judicialFormations({ period: "monthly", unitId: 55 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
