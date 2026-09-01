import { describe, expect, it } from "vitest";
import { buildInternalMailAssistantMessages, buildInternalMailSummaryMessages, canProcessInternalMailAssistantAction, normalizeInternalMailRecipients, richTextToPlainText, sanitizeInternalMailHtml } from "./internal-mail-service";

describe("مستلمو بريد ركيزة الداخلي", () => {
  it("يستبعد المرسل ويزيل التكرار ويحافظ على فصل إلى ونسخة ونسخة مخفية", () => {
    expect(normalizeInternalMailRecipients({ toProfileIds: [7, 7, 9], ccProfileIds: [9, 11], bccProfileIds: [7, 11, 13] }, 7)).toEqual({ toProfileIds: [9], ccProfileIds: [11], bccProfileIds: [13] });
  });

  it("يحفظ عناصر التنسيق المسموح بها فقط ويستبعد النصوص والروابط غير الآمنة", () => {
    const html = sanitizeInternalMailHtml('<p>نص <strong>مهم</strong></p><script>alert(1)</script><a href="javascript:alert(1)">سيئ</a><a href="https://example.com">سليم</a>');
    expect(html).toContain("<strong>مهم</strong>");
    expect(html).not.toContain("script");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://example.com"');
    expect(richTextToPlainText("<p>أول</p><ul><li>ثانٍ</li></ul>")).toContain("أول");
  });

  it("يسمح بصورة التوقيع المخزنة داخل ركيزة فقط ولا يقبل روابط الصور الخارجية", () => {
    const html = sanitizeInternalMailHtml('<p>مع التحية</p><img src="/manus-storage/internal-mail-signatures/17/signature.png" alt="توقيع"><img src="https://untrusted.example/signature.png" alt="خارجية">');
    expect(html).toContain('src="/manus-storage/internal-mail-signatures/17/signature.png"');
    expect(html).toContain('data-signature-image="true"');
    expect(html).not.toContain("untrusted.example");
  });

  it("يحجب تفويض المساعد عن البريد السري والنسخة المخفية والردود المنشأة آلياً", () => {
    const base = { automationAction: "none" as const, recipientType: "to" as const, sourceSenderProfileId: 9, recipientProfileId: 17, entryCategory: null, sourceSubject: "طلب متابعة", subjectContains: "متابعة" };
    expect(canProcessInternalMailAssistantAction(base)).toBe(true);
    expect(canProcessInternalMailAssistantAction({ ...base, entryCategory: "سري" })).toBe(false);
    expect(canProcessInternalMailAssistantAction({ ...base, recipientType: "bcc" })).toBe(false);
    expect(canProcessInternalMailAssistantAction({ ...base, automationAction: "reply" })).toBe(false);
    expect(canProcessInternalMailAssistantAction({ ...base, sourceSubject: "مراسلة سرية" })).toBe(false);
  });

  it("يبني طلب تلخيص مقيداً بموضوع الرسالة ونصها دون تعليمات تنفيذية", () => {
    const messages = buildInternalMailSummaryMessages("إجراء عاجل", "يرجى اعتماد الإجراء قبل نهاية اليوم.");
    expect(messages[0].content).toContain("لا تخترع معلومات");
    expect(messages[1].content).toContain("الموضوع: إجراء عاجل");
    expect(messages[1].content).toContain("قبل نهاية اليوم");
  });

  it("يبني اقتراحات رد وتدقيق لغوي لا تضيف وقائع أو التزامات جديدة", () => {
    const reply = buildInternalMailAssistantMessages({ subject: "طلب متابعة", body: "يرجى المراجعة", mode: "reply" });
    const proofread = buildInternalMailAssistantMessages({ subject: "مسودة", body: "نص", mode: "proofread" });
    expect(reply[0].content).toContain("لا تضف وقائع");
    expect(reply[0].content).toContain("JSON");
    expect(proofread[0].content).toContain("الحفاظ التام على المعنى");
  });
});
