import { describe, expect, it, beforeEach } from "vitest";
import { resetEmployeeAuthStore } from "./store";
import { confirmOneTimeCode, loginWithBiometric, loginWithPin, registerBiometric, registerStaff, setNotificationPreference, startPasswordRecovery } from "./service";

describe("دخول الموظفين المستقل", () => {
  beforeEach(() => resetEmployeeAuthStore());

  it("يرفض تسجيلاً لاسم غير موجود في السجل المعتمد", () => {
    expect(() => registerStaff({ fullName: "شخص غير مسجل", email: "a@moj.gov.sa", password: "Password1", pin: "123456" })).toThrow(/غير مطابق/);
  });

  it("يقبل التسجيل المطابق ويظهر OTP مرة واحدة ثم يسمح بالدخول اليومي بالـ PIN دون بريد", () => {
    const registered = registerStaff({ fullName: "عبدالله محمد الحميدي", email: "amhumaidi@moj.gov.sa", password: "Password1", pin: "147258" });
    expect(registered.oneTimeVerification.code).toMatch(/^\d{6}$/);
    confirmOneTimeCode({ challengeId: registered.oneTimeVerification.challengeId, code: registered.oneTimeVerification.code });
    const daily = loginWithPin("147258");
    expect(daily.employee.email).toBe("amhumaidi@moj.gov.sa");
    expect(daily.employee.fullName).toContain("الحميدي");
  });

  it("يدعم البصمة في الدخول اليومي ولا يخلطها بالإشعارات", () => {
    const registered = registerStaff({ fullName: "نورة سعد العتيبي", email: "noura@moj.gov.sa", password: "Password1", pin: "111222" });
    const session = confirmOneTimeCode({ challengeId: registered.oneTimeVerification.challengeId, code: registered.oneTimeVerification.code });
    registerBiometric(session.token, "device-fingerprint-1");
    const daily = loginWithBiometric("device-fingerprint-1");
    expect(daily.employee.fullName).toContain("نورة");
    const prefs = setNotificationPreference(daily.token, true);
    expect(prefs.notificationsEnabled).toBe(true);
  });

  it("يصدر OTP للاستعادة فقط وليس كشرط للدخول اليومي", () => {
    registerStaff({ fullName: "فهد عبدالعزيز القحطاني", email: "fahad@moj.gov.sa", password: "Password1", pin: "333444" });
    const recovery = startPasswordRecovery("fahad@moj.gov.sa");
    expect(recovery.code).toMatch(/^\d{6}$/);
    expect(loginWithPin("333444").employee.email).toBe("fahad@moj.gov.sa");
  });
});
