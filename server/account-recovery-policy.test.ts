import { describe, expect, it } from "vitest";
import { validateRecoveryEmailPair } from "./court-service";

describe("سياسة استعادة حساب قائم", () => {
  it("يطبع البريدين ويقبل البريد الرسمي مع قناة تنبيه مستقلة", () => {
    expect(validateRecoveryEmailPair(" Worker@MOJ.GOV.SA ", "alerts@example.com")).toEqual({ officialEmail: "worker@moj.gov.sa", notificationEmail: "alerts@example.com" });
    expect(validateRecoveryEmailPair("rakizaplatform@gmail.com", "alerts@example.com").officialEmail).toBe("rakizaplatform@gmail.com");
  });

  it("يرفض البريد غير المعتمد أو البريد المطابق للهوية", () => {
    expect(() => validateRecoveryEmailPair("worker@gmail.com", "alerts@example.com")).toThrow("غير معتمدة");
    expect(() => validateRecoveryEmailPair("worker@moj.gov.sa", "worker@moj.gov.sa")).toThrow("يجب أن يختلف");
    expect(() => validateRecoveryEmailPair("worker@moj.gov.sa", "not-an-email")).toThrow("غير صحيحة");
  });
});
