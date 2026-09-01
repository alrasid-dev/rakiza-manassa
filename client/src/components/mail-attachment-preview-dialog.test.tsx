import { describe, expect, it } from "vitest";
import { canPreviewMailAttachment } from "./MailAttachmentPreviewDialog";

describe("معاينة مرفقات بريد ركيزة", () => {
  it("تسمح بمعاينة الصور وPDF والنصوص وتحافظ على فتح الأنواع الأخرى كملف أصلي", () => {
    expect(canPreviewMailAttachment("image/png")).toBe(true);
    expect(canPreviewMailAttachment("application/pdf")).toBe(true);
    expect(canPreviewMailAttachment("text/plain")).toBe(true);
    expect(canPreviewMailAttachment("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(false);
  });
});
