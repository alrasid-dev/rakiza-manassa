import { describe, expect, it, vi } from "vitest";
import { installSurface, isStandaloneDisplay, platformHref, platformServiceWorkerUrl, registerPlatformServiceWorker } from "./pwa";

describe("تسجيل تطبيق الويب التقدمي", () => {
  it("يسجل عامل الخدمة ضمن نطاق المنصة", async () => {
    const register = vi.fn(async () => "registered");
    await expect(registerPlatformServiceWorker({ register })).resolves.toBe("registered");
    expect(register).toHaveBeenCalledWith(platformServiceWorkerUrl(), { scope: expect.stringMatching(/\/$/) });
  });

  it("لا يعرقل تشغيل المنصة عندما لا يدعم المتصفح عامل الخدمة", async () => {
    await expect(registerPlatformServiceWorker(undefined)).resolves.toBeNull();
  });

  it("يبني روابط التثبيت حسب مسار النشر", () => {
    expect(platformHref("apps", "/")).toBe("/apps");
    expect(platformHref("/login", "/rakiza-manassa/")).toBe("/rakiza-manassa/login");
  });

  it("يميّز سطح التثبيت حسب الجهاز وحالة التطبيق", () => {
    expect(installSurface("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", false)).toBe("ios");
    expect(installSurface("Mozilla/5.0 (Linux; Android 14) Chrome/120", false)).toBe("android");
    expect(installSurface("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", false)).toBe("desktop");
    expect(installSurface("Mozilla/5.0 (iPhone)", true)).toBe("installed");
    expect(isStandaloneDisplay(() => ({ matches: true }) as MediaQueryList)).toBe(true);
  });
});
