type ExportRecipient = { recipientType: "to" | "cc" | "bcc" | "sender"; fullName?: string | null; email?: string | null };
type MailExportInput = { subject: string; body: string; bodyHtml?: string | null; senderName?: string | null; senderEmail?: string | null; recipients: ExportRecipient[]; sentAt?: Date | string | null };

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
const encodeHeader = (value: string) => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(value)))}?=`;
const address = (name?: string | null, email?: string | null) => `${encodeHeader(name || "بريد ركيزة")} <${email || "mail@rakiza.internal"}>`;

export function buildInternalMailEml(input: MailExportInput) {
  const byType = (type: ExportRecipient["recipientType"]) => input.recipients.filter(item => item.recipientType === type).map(item => address(item.fullName, item.email)).join(", ");
  const bodyHtml = input.bodyHtml || `<p>${escapeHtml(input.body || "")}</p>`;
  return [
    `From: ${address(input.senderName, input.senderEmail)}`,
    `To: ${byType("to")}`,
    byType("cc") ? `Cc: ${byType("cc")}` : "",
    `Subject: ${encodeHeader(input.subject || "(بدون موضوع)")}`,
    `Date: ${new Date(input.sentAt || Date.now()).toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    bodyHtml,
  ].filter(Boolean).join("\r\n");
}

export function exportInternalMailToOutlook(input: MailExportInput) {
  const safeName = (input.subject || "rakiza-mail").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 90);
  const url = URL.createObjectURL(new Blob([buildInternalMailEml(input)], { type: "message/rfc822;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${safeName}.eml`; anchor.click(); URL.revokeObjectURL(url);
}
