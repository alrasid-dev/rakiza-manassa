import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPersonalDisciplinaryActions: vi.fn(async () => [{ approval: { id: 3, status: "pending" }, taskTitle: "مهمة شخصية" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getProfileForUser: vi.fn(async () => ({ id: 9, fullName: "موظف", personType: "administrative" })),
    listPersonalDisciplinaryActions: mocks.listPersonalDisciplinaryActions,
  };
});

import { courtRouter } from "./routers/court";

describe("court.disciplinary.mine", () => {
  it("يعيد مساءلات الملف الشخصي فقط دون قبول معرّف من العميل", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(caller.disciplinary.mine()).resolves.toEqual([{ approval: { id: 3, status: "pending" }, taskTitle: "مهمة شخصية" }]);
    expect(mocks.listPersonalDisciplinaryActions).toHaveBeenCalledWith(9);
  });
});
