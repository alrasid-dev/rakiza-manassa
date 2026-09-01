import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { detectExcelChangeCandidates } from "./excel-change-detector";

describe("رصد تغيّرات ملفات Excel", () => {
  it("يستخرج مهمة متابعة من قالب المتعثرات مع مفتاح وبصمة", () => {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["تصنيف التعثر", "تاريخ نشوء التعثر", "حالة المعالجة", "الملازم القضائي", "رقم المرجع"],
      ["تأخر صك", "2026-08-14", "تحت المتابعة", "ملازم تجريبي", "R-100"],
    ]);
    XLSX.utils.book_append_sheet(book, sheet, "المتعثرات");
    const content = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    const rows = detectExcelChangeCandidates(content, "delay_register");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.sourceKey).toContain("R-100");
    expect(rows[0]?.fingerprint).toHaveLength(64);
  });
});
