import { describe, expect, it } from "vitest";
import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({
  user: {
    id: 9,
    role: "user",
    email: "employee@moj.gov.sa",
    name: "موظف اختبار",
    openId: "employee",
  },
} as never);

describe("إعداد FCM Web العام", () => {
  it("يعرض مفتاح VAPID العام عبر إجراء إعدادات الإشعارات", async () => {
    const result = await caller().notifications.pushConfig();
    expect(result.publicKey).toBeTypeOf("string");
    expect(result.publicKey.length).toBeGreaterThan(20);
    expect(result.publicKey).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
