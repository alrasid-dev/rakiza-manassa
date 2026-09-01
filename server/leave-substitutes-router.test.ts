import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listAdministrativeSubstitutes: vi.fn(async () => [{ id: 14, fullName: "موظف بديل" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getProfileForUser: vi.fn(async () => ({ id: 9, fullName: "موظف إداري", personType: "administrative", unitId: 1 })),
    listAdministrativeSubstitutes: mocks.listAdministrativeSubstitutes,
  };
});

import { courtRouter } from "./routers/court";

describe("court.leave.substitutes", () => {
  it("يعيد بدلاء الموظف الإداري ضمن وحدته فقط", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    const substitutes = await caller.leave.substitutes();

    expect(mocks.listAdministrativeSubstitutes).toHaveBeenCalledWith(1, 9);
    expect(substitutes).toEqual([{ id: 14, fullName: "موظف بديل" }]);
  });
});
