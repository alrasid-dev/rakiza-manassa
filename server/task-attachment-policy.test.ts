import { describe, expect, it } from "vitest";
import { validateTaskAttachment } from "./task-attachment-policy";

const pdfBase64 = Buffer.from("%PDF-1.7\nركيزة").toString("base64");
const pngBase64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64");

describe("سياسة مرفقات المهمة", () => {
  it("تقبل ملف PDF صحيحاً وتطبع نوعه وحجمه", () => {
    const result = validateTaskAttachment({ originalName: "خطاب.pdf", mimeType: "application/pdf", contentBase64: pdfBase64 });
    expect(result.mimeType).toBe("application/pdf");
    expect(result.bytes.byteLength).toBeGreaterThan(0);
  });

  it("تقبل صورة PNG صحيحة وترفض تنكر الملف كـ PDF", () => {
    expect(validateTaskAttachment({ originalName: "إثبات.png", mimeType: "image/png", contentBase64: pngBase64 }).mimeType).toBe("image/png");
    expect(() => validateTaskAttachment({ originalName: "تنكر.pdf", mimeType: "application/pdf", contentBase64: pngBase64 })).toThrow("لا يطابق");
  });

  it("ترفض الامتداد أو الاسم غير الآمن", () => {
    expect(() => validateTaskAttachment({ originalName: "../../ملف.pdf", mimeType: "application/pdf", contentBase64: pdfBase64 })).toThrow("اسم المرفق");
    expect(() => validateTaskAttachment({ originalName: "ملف.docx", mimeType: "application/pdf", contentBase64: pdfBase64 })).toThrow("امتداد المرفق");
  });
});
