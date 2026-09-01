import { describe, expect, it } from "vitest";
import { RAKIZA_BRAND, RAKIZA_HEADER, RAKIZA_BRAND_LINE } from "@/branding";

describe("هوية رَكيزة المرئية", () => {
  it("يستخدم الاسم العربي في عناصر الهوية الأساسية", () => {
    expect(RAKIZA_BRAND).toBe("رَكيزة");
    expect(RAKIZA_BRAND_LINE).toContain(RAKIZA_BRAND);
    expect(RAKIZA_HEADER).toContain(RAKIZA_BRAND);
  });
});
