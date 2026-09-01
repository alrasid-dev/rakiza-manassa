import { describe, expect, it } from "vitest";
import { isAllowedLoginEmail, isAllowedRegistrationEmail, isOfficialMojEmail } from "./court-service";

describe("تحقق البريد الرسمي لرَكيزة", () => {
  it("يقبل بريد moj.gov.sa مع اختلاف حالة الأحرف والمسافات", () => {
    expect(isOfficialMojEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
    expect(isAllowedLoginEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
    expect(isAllowedRegistrationEmail("  Employee@MOJ.GOV.SA ")).toBe(true);
  });

  it("يقبل الاستثناءين الفرديين المحددين فقط", () => {
    for (const email of ["rakizaplatform@gmail.com", "abdulaziz.stocks11@gmail.com"]) {
      expect(isOfficialMojEmail(email)).toBe(false);
      expect(isAllowedLoginEmail(email)).toBe(true);
      expect(isAllowedRegistrationEmail(email)).toBe(true);
    }
  });

  it("يرفض Gmail وHotmail وبقية العناوين الشخصية غير المصرح بها", () => {
    for (const email of [
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
