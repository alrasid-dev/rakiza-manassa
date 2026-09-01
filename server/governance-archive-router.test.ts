import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  permission: "employee" as "employee" | "general_view",
  listGovernanceArchive: vi.fn(async () => [{ approval: { id: 31, entityType: "disciplinary_action", entityId: 18, status: "approved" }, requesterName: "فهد", deciderName: "الرئيس", taskComments: [] }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getAccessPermission: vi.fn(async () => mocks.permission), getEffectiveRoles: vi.fn(async () => []), listGovernanceArchive: mocks.listGovernanceArchive };
});

import { courtRouter } from "./routers/court";

describe("أرشيف الحوكمة", () => {
  it("يعيد للقيادة السجل المنتهي مع تمرير عوامل التصفية فقط", async () => {
    const caller = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "المالك", openId: "owner" } } as never);
    await expect(caller.archive.governance({ entityType: "disciplinary_action", status: "approved" })).resolves.toHaveLength(1);
    expect(mocks.listGovernanceArchive).toHaveBeenCalledWith({ entityType: "disciplinary_action", status: "approved" });
  });

  it("يرفض استرجاع الأرشيف عن الموظف غير المخول", async () => {
    mocks.permission = "employee";
    const caller = courtRouter.createCaller({ user: { id: 8, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(caller.archive.governance()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
