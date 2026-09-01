import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookies";

describe("خصائص كوكي الجلسة", () => {
  it("يحمي الكوكي من JavaScript ويقيده بالمسار الكامل", () => {
    const options = getSessionCookieOptions({ protocol: "https", headers: {} } as never);
    expect(options).toMatchObject({ httpOnly: true, path: "/", sameSite: "none", secure: true });
  });

  it("يفرض Secure عندما يعلن الوكيل أن الطلب الأصلي HTTPS", () => {
    const options = getSessionCookieOptions({ protocol: "http", headers: { "x-forwarded-proto": "https" } } as never);
    expect(options.secure).toBe(true);
  });
});
