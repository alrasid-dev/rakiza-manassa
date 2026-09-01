import { describe, expect, it } from "vitest";
import { validateSupportAttachments } from "./support-attachment-policy";

const pngBase64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64");

describe("سياسة مرفقات الدعم", () => {
  it("تقبل صورة PNG صحيحة باسم وامتداد متوافقين", () => {
    expect(() => validateSupportAttachments([{ originalName: "screen.png", mimeType: "image/png", contentBase64: pngBase64 }])).not.toThrow();
  });

  it("ترفض اسماً مضللاً أو بصمة لا توافق النوع المعلن", () => {
    expect(() => validateSupportAttachments([{ originalName: "screen.exe", mimeType: "image/png", contentBase64: pngBase64 }])).toThrow("غير مسموح");
    expect(() => validateSupportAttachments([{ originalName: "screen.png", mimeType: "image/png", contentBase64: Buffer.from("not an image").toString("base64") }])).toThrow("لا يطابق");
  });
});
