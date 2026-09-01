import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listRegistrationRequests: vi.fn(async () => [{ id: 77, officialEmail: "amhumaidi@moj.gov.sa", status: "pending" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => null),
    listRegistrationRequests: mocks.listRegistrationRequests,
  };
});

import { courtRouter } from "./routers/court";

describe("صلاحية مالك رَكيزة", () => {
  it("يعرض طلبات التسجيل لبريد مالك المنصة المهيأ", async () => {
    const owner = courtRouter.createCaller({ user: { id: 1, role: "user", email: "rakizaplatform@gmail.com", name: "مالك رَكيزة", openId: "owner" } } as never);
    await expect(owner.registration.list()).resolves.toEqual([{ id: 77, officialEmail: "amhumaidi@moj.gov.sa", status: "pending" }]);
  });

  it("يمنع حساب القيادة غير المالك من إدارة طلبات التسجيل", async () => {
    const president = courtRouter.createCaller({ user: { id: 2, role: "user", email: "president@moj.gov.sa", name: "رئيس المحكمة", openId: "president" } } as never);
    await expect(president.registration.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
