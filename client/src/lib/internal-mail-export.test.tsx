import { describe, expect, it } from "vitest";
import { buildInternalMailEml } from "./internalMailExport";

describe("تصدير بريد ركيزة إلى Outlook", () => {
  it("ينشئ ملف EML بعناوين UTF-8 ومحتوى HTML ومستلمي إلى ونسخة", () => {
    const eml = buildInternalMailEml({ subject: "خطاب عربي", body: "نص الرسالة", bodyHtml: "<p>نص <b>منسق</b></p>", senderName: "مرسل ركيزة", senderEmail: "sender@rakiza.internal", sentAt: "2026-08-26T10:00:00Z", recipients: [{ recipientType: "to", fullName: "مستلم", email: "to@rakiza.internal" }, { recipientType: "cc", fullName: "نسخة", email: "cc@rakiza.internal" }] });
    expect(eml).toContain("Subject: =?UTF-8?B?");
    expect(eml).toContain("To:");
    expect(eml).toContain("Cc:");
    expect(eml).toContain('Content-Type: text/html; charset="UTF-8"');
    expect(eml).toContain("<p>نص <b>منسق</b></p>");
  });
});
