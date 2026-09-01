import { describe, expect, it } from "vitest";

describe("Brevo delivery check", () => {
  it("يفحص آخر الرسائل دون طباعة محتوى OTP أو المفتاح", async () => {
    const key = process.env.BREVO_API_KEY;
    expect(key).toBeTruthy();
    const response = await fetch("https://api.brevo.com/v3/smtp/emails?email=Amhumaidi%40moj.gov.sa&limit=10&sort=desc", {
      headers: { accept: "application/json", "api-key": key as string },
    });
    const rawBody = await response.text();
    expect(response.ok, `Brevo delivery lookup failed with HTTP ${response.status}: ${rawBody.slice(0, 240)}`).toBe(true);
    const body = JSON.parse(rawBody) as { transactionalEmails?: Array<Record<string, unknown>> };
    const rows = (body.transactionalEmails ?? []).map(item => ({
      messageId: item.messageId,
      to: item.to,
      subject: item.subject,
      date: item.date,
      event: item.event,
    }));
    console.log("BREVO_DELIVERY_SUMMARY", JSON.stringify(rows));
    const latestMessageId = typeof rows[0]?.messageId === "string" ? rows[0].messageId : null;
    const eventsResponse = await fetch("https://api.brevo.com/v3/smtp/statistics/events?limit=50&startDate=2026-08-20&endDate=2026-08-21&email=Amhumaidi%40moj.gov.sa&sort=desc", {
      headers: { accept: "application/json", "api-key": key as string },
    });
    const eventsBody = await eventsResponse.text();
    console.log("BREVO_EVENTS", eventsResponse.status, eventsBody.slice(0, 2400).replace(/(content|textContent|htmlContent|code|api-key)":\\s*"[^"]*"/gi, "$1\":\"[REDACTED]\""));
  }, 15_000);
});
