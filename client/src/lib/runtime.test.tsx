import { describe, expect, it } from "vitest";
import { STATIC_HOST_LOGIN_MESSAGE, isPublicStaticHost, messageIfHtmlApiBody, operationalLoginHref, trpcHttpUrl } from "./runtime";

describe("تشغيل الدخول", () => {
  it("يميّز صفحات غيث هاب عن خادم التشغيل", () => {
    expect(isPublicStaticHost("alrasid-dev.github.io")).toBe(true);
    expect(isPublicStaticHost("rakiza-manassa.vercel.app")).toBe(false);
  });

  it("يحوّل استجابة HTML إلى رسالة دخول عربية", () => {
    expect(messageIfHtmlApiBody("<html> <head>", "text/html")).toBe(STATIC_HOST_LOGIN_MESSAGE);
    expect(messageIfHtmlApiBody('{"ok":true}', "application/json")).toBeNull();
  });

  it("يبني رابط الدخول الكامل عند توفر أصل التشغيل", () => {
    expect(operationalLoginHref("?next=/", { VITE_OPERATIONAL_ORIGIN: "https://rakiza-manassa.vercel.app" })).toBe("https://rakiza-manassa.vercel.app/login?next=/");
    expect(trpcHttpUrl()).toBe("/api/trpc");
  });
});
