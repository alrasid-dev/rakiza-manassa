import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfileForUser: vi.fn(async () => ({ id: 17, unitId: 4, status: "active" })),
  recordUserActivity: vi.fn(async (input: { userId: number; activityState: string }) => ({ success: true, profileId: 17, activityState: input.activityState })),
}));

vi.mock("./court-service", async importOriginal => ({
  ...(await importOriginal<typeof import("./court-service")>()),
  getProfileForUser: mocks.getProfileForUser,
  recordUserActivity: mocks.recordUserActivity,
}));

import { courtRouter } from "./routers/court";

describe("court.notifications.activity", () => {
  it("يسجل نشاط الحساب الحالي بحالة العمل على المنصة", async () => {
    const caller = courtRouter.createCaller({ user: { id: 21, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);
    await expect(caller.notifications.activity({ activityState: "active" })).resolves.toEqual({ success: true, profileId: 17, activityState: "active" });
    expect(mocks.recordUserActivity).toHaveBeenCalledWith({ userId: 21, activityState: "active" });
  });
});
