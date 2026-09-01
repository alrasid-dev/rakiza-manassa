import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfileForUser: vi.fn(async () => ({ id: 42, fullName: "موظف اختبار", unitId: 7 })),
  upsertFcmToken: vi.fn(async () => ({ success: true as const })),
  removeFcmToken: vi.fn(async () => ({ success: true as const })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getProfileForUser: mocks.getProfileForUser };
});
vi.mock("./fcm-service", () => ({
  upsertFcmToken: mocks.upsertFcmToken,
  removeFcmToken: mocks.removeFcmToken,
  sendFcmToProfile: vi.fn(),
}));

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 9, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);

describe("تسجيل FCM Token", () => {
  it("يربط الرمز بملف الحساب الحالي ويحدد نسخة PWA", async () => {
    await expect(caller().notifications.fcmSubscribe({ token: "a".repeat(64), platform: "web-pwa", userAgent: "Chrome PWA" })).resolves.toEqual({ success: true });
    expect(mocks.upsertFcmToken).toHaveBeenCalledWith({ profileId: 42, token: "a".repeat(64), platform: "web-pwa", userAgent: "Chrome PWA" });
  });

  it("يتيح حذف الرمز للحساب الحالي فقط", async () => {
    await expect(caller().notifications.fcmUnsubscribe({ token: "b".repeat(64) })).resolves.toEqual({ success: true });
    expect(mocks.removeFcmToken).toHaveBeenCalledWith(42, "b".repeat(64));
  });
});
