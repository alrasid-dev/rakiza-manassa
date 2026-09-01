import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listAvailable: vi.fn(async () => [{ account: { id: 7, displayName: "قسم تسليم الأحكام" }, delegation: { id: 12, delegateUserId: 55 } }]),
  active: vi.fn(async () => ({ account: { id: 7, displayName: "قسم تسليم الأحكام" }, delegation: { id: 12, delegateUserId: 55 } })),
  switchIdentity: vi.fn(async () => ({ selectedIdentity: "department_account" as const, account: { id: 7, displayName: "قسم تسليم الأحكام" }, delegation: { id: 12 } })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, listAvailableDepartmentIdentities: mocks.listAvailable, getActiveDepartmentIdentityForUser: mocks.active, switchActiveDepartmentIdentity: mocks.switchIdentity };
});

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 55, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "otp:employee" } } as never);

describe("هوية حساب القسم", () => {
  it("يعرض التكليف النشط ويبدل فقط عبر إجراء الجلسة المحمية", async () => {
    await expect(caller().departmentIdentity.available()).resolves.toEqual({ activeAccountId: 7, identities: [{ account: { id: 7, displayName: "قسم تسليم الأحكام" }, delegation: { id: 12, delegateUserId: 55 } }] });
    await expect(caller().departmentIdentity.switch({ departmentAccountId: 7 })).resolves.toMatchObject({ selectedIdentity: "department_account", account: { id: 7 } });
    expect(mocks.switchIdentity).toHaveBeenCalledWith({ userId: 55, departmentAccountId: 7 });
  });
});
