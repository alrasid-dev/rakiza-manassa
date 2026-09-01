import { describe, expect, it, vi } from "vitest";
import { registerPlatformServiceWorker } from "./pwa";

describe("تسجيل تطبيق الويب التقدمي", () => {
  it("يسجل عامل الخدمة ضمن نطاق المنصة", async () => {
    const register = vi.fn(async () => "registered");
    await expect(registerPlatformServiceWorker({ register })).resolves.toBe("registered");
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("لا يعرقل تشغيل المنصة عندما لا يدعم المتصفح عامل الخدمة", async () => {
    await expect(registerPlatformServiceWorker(undefined)).resolves.toBeNull();
  });
});
