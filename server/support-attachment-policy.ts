export type SupportAttachmentInput = {
  originalName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  contentBase64: string;
};

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const extensionsByMime: Record<SupportAttachmentInput["mimeType"], string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

function hasExpectedSignature(content: Buffer, mimeType: SupportAttachmentInput["mimeType"]) {
  if (mimeType === "image/png") return content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/jpeg") return content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
  return content.length >= 12 && content.subarray(0, 4).toString("ascii") === "RIFF" && content.subarray(8, 12).toString("ascii") === "WEBP";
}

export function validateSupportAttachments(attachments: SupportAttachmentInput[] | undefined) {
  for (const attachment of attachments ?? []) {
    const name = attachment.originalName.trim().toLowerCase();
    if (!name || /[\\/\0]/.test(name) || !extensionsByMime[attachment.mimeType].some(extension => name.endsWith(extension))) {
      throw new Error("اسم المرفق أو امتداده غير مسموح به.");
    }
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(attachment.contentBase64) || attachment.contentBase64.length % 4 !== 0) {
      throw new Error("صيغة المرفق غير صالحة.");
    }
    const content = Buffer.from(attachment.contentBase64, "base64");
    if (!content.length || content.length > MAX_ATTACHMENT_BYTES) throw new Error("حجم المرفق يتجاوز الحد المسموح به وهو 2 ميغابايت.");
    if (!hasExpectedSignature(content, attachment.mimeType)) throw new Error("نوع بيانات المرفق لا يطابق الامتداد المعلن.");
  }
}
