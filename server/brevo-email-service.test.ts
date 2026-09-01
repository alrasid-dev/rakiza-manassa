import { afterEach, describe, expect, it, vi } from "vitest";
import { sendBrevoTransactionalEmail } from "./court-service";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

describe("خدمة بريد Brevo", () => {
  it("ترسل بريداً معاملاتياً دون تسجيل المفتاح أو الرمز", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ messageId: "<brevo-message>" }), { status: 201, headers: { "content-type": "application/json" } }));
    const result = await sendBrevoTransactionalEmail({ to: "worker@moj.gov.sa", recipientName: "موظف مختبر", subject: "رمز دخول رَكيزة", textContent: "رمز تحقق مؤقت" });
    expect(result).toEqual({ accepted: true, messageId: "<brevo-message>" });
    expect(globalThis.fetch).toHaveBeenCalledWith("https://api.brevo.com/v3/smtp/email", expect.objectContaining({ method: "POST" }));
    const request = vi.mocked(globalThis.fetch).mock.calls[0]?.[1] as RequestInit;
    expect(String(request.body)).not.toContain("xkeysib");
  });

  it("تحول فشل Brevo إلى خطأ مختصر دون كشف البيانات الحساسة", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("invalid api key", { status: 401 }));
    await expect(sendBrevoTransactionalEmail({ to: "worker@moj.gov.sa", subject: "اختبار", textContent: "نص" })).rejects.toThrow(/HTTP 401/);
  });
});
