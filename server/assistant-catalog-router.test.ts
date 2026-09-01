import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfileForUser: vi.fn(async () => ({ id: 24, userId: 7, unitId: 44, fullName: "موظف القسم" })),
  listOrganizationUnits: vi.fn(async () => [{ id: 44, name: "قسم تسليم الأحكام", code: "JD-DELIVERY" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getEffectiveRoles: vi.fn(async () => []),
    getProfileForUser: mocks.getProfileForUser,
    listOrganizationUnits: mocks.listOrganizationUnits,
  };
});

import { courtRouter } from "./routers/court";

describe("كتالوج مساعدي ركيزة", () => {
  it("يعيد مساعد القسم باسم وحدة الموظف من دون صلاحية إدارة الأتمتة", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);

    await expect(caller.assistants.catalog()).resolves.toEqual([
      {
        key: "department",
        label: "مساعد قسم تسليم الأحكام",
        description: "مساعد عملي لمهام قسم تسليم الأحكام ومراسلاته وتنبيهاته ضمن ما تسمح به صلاحية المستخدم.",
        canManageAutomation: false,
      },
    ]);
  });
});
