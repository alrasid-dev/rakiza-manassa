import { describe, expect, it } from "vitest";

describe("هوية ركيزة", () => {
  it("يقرأ اسم التطبيق الرسمي من بيئة التشغيل", () => {
    expect(process.env.VITE_APP_TITLE).toBe("رَكيزة");
  });
});
