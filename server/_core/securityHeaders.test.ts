import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "./securityHeaders";

describe("رؤوس حماية المنصة", () => {
  it("تضيف رؤوس الحماية الأساسية في جميع البيئات", () => {
    const headers = buildSecurityHeaders(false);
    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    expect(headers["Content-Security-Policy"]).toBeUndefined();
  });

  it("يقيد المحتوى في الإنتاج مع الحفاظ على تكامل Teams والخطوط", () => {
    const csp = buildSecurityHeaders(true)["Content-Security-Policy"];
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self' https://teams.microsoft.com");
    expect(csp).toContain("https://fonts.googleapis.com");
    expect(csp).toContain("https://identitytoolkit.googleapis.com");
    expect(csp).toContain("https://firestore.googleapis.com");
    expect(csp).toContain("frame-src 'self' https://*.firebaseapp.com");
  });
});
