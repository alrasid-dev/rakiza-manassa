import { describe, expect, it } from "vitest";


const __secretReady = Boolean(process.env.VITE_APP_TITLE?.trim());

describe("هوية ركيزة", () => {
  it.skipIf(!__secretReady)("يقرأ اسم التطبيق الرسمي من بيئة التشغيل", () => {
    expect(process.env.VITE_APP_TITLE).toBe("رَكيزة");
  });
});
