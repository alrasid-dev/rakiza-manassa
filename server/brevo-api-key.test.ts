import { describe, expect, it } from "vitest";

describe("Brevo API key", () => {
  it("يقبل المفتاح الجديد على نقطة account دون إرسال بريد", async () => {
    const key = process.env.BREVO_API_KEY;
    expect(key, "BREVO_API_KEY غير مضبوط").toBeTruthy();
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: { accept: "application/json", "api-key": key as string },
    });
    expect(response.ok, `Brevo account check failed with HTTP ${response.status}`).toBe(true);
    const body = (await response.json()) as { email?: string };
    expect(body.email).toBeTruthy();
  }, 15_000);
});
