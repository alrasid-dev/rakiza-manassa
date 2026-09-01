import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfileForUser: vi.fn(async () => ({ id: 42, fullName: "موظف اختبار", unitId: 7 })),
  sendPushForNotification: vi.fn(async () => ({ sent: 1, removed: 0, skipped: false })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getProfileForUser: mocks.getProfileForUser };
});
vi.mock("./push-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./push-service")>();
  return { ...actual, sendPushForNotification: mocks.sendPushForNotification };
});

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 9, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);

describe("اختبار Web Push للحساب الحالي", () => {
  it("يرسل اختباراً إلى ملف الحساب الحالي فقط", async () => {
    await expect(caller().notifications.test()).resolves.toEqual({ success: true });
    expect(mocks.getProfileForUser).toHaveBeenCalledWith(9);
    expect(mocks.sendPushForNotification).toHaveBeenCalledWith(42, expect.objectContaining({ tag: "push-test-42" }));
  });

  it("يرفض الاختبار عند عدم وجود اشتراك نشط برسالة قابلة للتنفيذ", async () => {
    mocks.sendPushForNotification.mockResolvedValueOnce({ sent: 0, removed: 0, skipped: false });
    await expect(caller().notifications.test()).rejects.toMatchObject({ code: "PRECONDITION_FAILED", message: expect.stringContaining("إيقاف") });
  });

  it("يميز غياب إعدادات الخادم عن غياب اشتراك الجهاز", async () => {
    mocks.sendPushForNotification.mockResolvedValueOnce({ sent: 0, removed: 0, skipped: true });
    await expect(caller().notifications.test()).rejects.toMatchObject({ code: "PRECONDITION_FAILED", message: expect.stringContaining("الخادم") });
  });
});
