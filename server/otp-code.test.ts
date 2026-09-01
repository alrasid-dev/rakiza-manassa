import { describe, expect, it } from "vitest";
import { otpDigest } from "./court-service";

describe("OTP digest timestamp precision", () => {
  it("يبقى مطابقاً عندما تحفظ قاعدة البيانات الثواني دون المللي ثانية", () => {
    const generatedExpiry = new Date("2026-08-20T23:10:30.987Z");
    const databaseExpiry = new Date("2026-08-20T23:10:30.000Z");
    expect(otpDigest("rakizaplatform@gmail.com", "123456", generatedExpiry)).toBe(
      otpDigest("rakizaplatform@gmail.com", "123456", databaseExpiry),
    );
  });

  it("يغير البصمة عند اختلاف البريد أو الرمز أو وقت الانتهاء بالثواني", () => {
    const expiry = new Date("2026-08-20T23:10:30.000Z");
    const digest = otpDigest("rakizaplatform@gmail.com", "123456", expiry);
    expect(otpDigest("rakizaplatform@gmail.com", "654321", expiry)).not.toBe(digest);
    expect(otpDigest("other@example.com", "123456", expiry)).not.toBe(digest);
    expect(otpDigest("rakizaplatform@gmail.com", "123456", new Date("2026-08-20T23:10:31.000Z"))).not.toBe(digest);
  });
});
