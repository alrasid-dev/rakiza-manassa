import { describe, expect, it } from "vitest";
import { isAllowedLoginEmail, isAllowedRegistrationEmail, isOfficialMojEmail, isPlatformOwnerEmail } from "./court-service";

describe("تحقق البريد الرسمي لرَكيزة", () => {
  it("يقبل بريد moj.gov.sa مع اختلاف حالة الأحرف والمسافات", () => {
    expect(isOfficialMojEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
    expect(isAllowedLoginEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
    expect(isAllowedRegistrationEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
  });

  it("يقبل بريد مالك المنصة فقط كاستثناء خارج النطاق الرسمي", () => {
    expect(isOfficialMojEmail("rakizaplatform@gmail.com")).toBe(false);
    expect(isPlatformOwnerEmail("rakizaplatform@gmail.com")).toBe(true);
    expect(isAllowedLoginEmail("rakizaplatform@gmail.com")).toBe(true);
    expect(isAllowedRegistrationEmail("rakizaplatform@gmail.com")).toBe(true);
  });

  it("يرفض الاستثناء القديم abdulaziz.stocks11@gmail.com وبقية العناوين الشخصية", () => {
    for (const email of [
      "abdulaziz.stocks11@gmail.com",
      "someone@gmail.com",
      "employee@hotmail.com",
      "rakizaplatform2@gmail.com",
      "employee@moj.gov.ss",
      "employee@fake-moj.gov.sa.example.com",
    ]) {
      expect(isAllowedLoginEmail(email)).toBe(false);
      expect(isAllowedRegistrationEmail(email)).toBe(false);
    }
  });
});
