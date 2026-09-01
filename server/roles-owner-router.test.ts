import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assignCourtRole: vi.fn(async () => 47),
  revokeCourtRole: vi.fn(async () => undefined),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, assignCourtRole: mocks.assignCourtRole, revokeCourtRole: mocks.revokeCourtRole };
});

import { courtRouter } from "./routers/court";

describe("إدارة أدوار القيادة", () => {
  it("تسمح للمالك بمنح دور الرئيس المساعد وسحبه مع تسجيل المنفذ", async () => {
    const owner = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "المالك", openId: "owner" } } as never);
    await expect(owner.roles.assign({ userId: 9, role: "assistant_president" })).resolves.toEqual({ id: 47 });
    expect(mocks.assignCourtRole).toHaveBeenCalledWith({ userId: 9, role: "assistant_president", delegatedByUserId: 1 });

    await expect(owner.roles.revoke({ assignmentId: 47 })).resolves.toEqual({ success: true });
    expect(mocks.revokeCourtRole).toHaveBeenCalledWith(47, 1);
  });

  it("يرفض منح أو سحب الصلاحيات من حساب غير مالك", async () => {
    const nonOwner = courtRouter.createCaller({ user: { id: 2, role: "user", email: "user@court.example", name: "مستخدم", openId: "user" } } as never);
    await expect(nonOwner.roles.assign({ userId: 9, role: "assistant_president" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(nonOwner.roles.revoke({ assignmentId: 47 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
