import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listProfiles: vi.fn(async () => [{ id: 10, fullName: "موظف إداري", personType: "administrative" }]),
  listTraineeOperations: vi.fn(async () => [{ profile: { id: 22, fullName: "ملازم قضائي" }, readiness: { ready: false, reasons: ["مهام مفتوحة"] } }]),
  getOperationalReport: vi.fn(async () => ({ period: "daily", startAt: new Date("2026-08-14T00:00:00.000Z"), tasks: { total: 1, completed: 0, overdue: 0 }, delays: { total: 0, open: 0, overdue: 0 }, scores: { positive: 0, negative: 0 }, transfers: { ready: 0, notReady: 1 } })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, listProfiles: mocks.listProfiles, listTraineeOperations: mocks.listTraineeOperations, getOperationalReport: mocks.getOperationalReport };
});

import { courtRouter } from "./routers/court";

describe("استعلامات الصفحات التشغيلية للقيادة", () => {
  it("تعيد بيانات الأفراد والملازمين والتقرير دون خطأ بحساب قيادي", async () => {
    const caller = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "المالك", openId: "owner" } } as never);

    await expect(caller.people.list()).resolves.toEqual([{ id: 10, fullName: "موظف إداري", personType: "administrative" }]);
    await expect(caller.trainees.overview()).resolves.toHaveLength(1);
    await expect(caller.reports.operational({ period: "daily", personType: "administrative" })).resolves.toMatchObject({ period: "daily", tasks: { total: 1 } });
    expect(mocks.getOperationalReport).toHaveBeenCalledWith({ period: "daily", personType: "administrative" });
  });
});
