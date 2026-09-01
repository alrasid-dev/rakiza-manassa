import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { detectExcelChangeCandidates } from "./excel-change-detector";
import { analyzeExcelImport } from "./import-validator";
import { retainJudicialTraineeRows } from "./linked-source-filter";

function linkedWorkbookBuffer() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["تصنيف التعثر", "تاريخ نشوء التعثر", "حالة المعالجة", "اسم الملازم القضائي", "رقم المرجع"],
    ["تأخر اعتماد صك", "2026-08-14", "تحت المتابعة", "ملازم أول", "T-101"],
    ["إجراء إداري داخلي", "2026-08-14", "تحت المتابعة", "", "A-999"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "المصدر المرتبط");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("المسار المتكامل لمصدر Excel المرتبط بالملازمين", () => {
  it("لا يمرر صفاً غير مرتبط بملازم قضائي إلى مرحلة استخراج تغييرات المتابعة", () => {
    const filtered = retainJudicialTraineeRows(linkedWorkbookBuffer());
    const analysis = analyzeExcelImport(filtered.content);
    const candidates = detectExcelChangeCandidates(filtered.content, analysis.template);

    expect(filtered).toMatchObject({ retainedRows: 1, skippedRows: 1 });
    expect(analysis).toMatchObject({ template: "delay_register", status: "validated", rowCount: 1 });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ title: "تأخر اعتماد صك", relatedName: "ملازم أول", sourceKey: "delay_register:T-101:ملازم أول" });
    expect(candidates.some(candidate => candidate.summary.includes("إجراء إداري داخلي") || candidate.sourceKey.includes("A-999"))).toBe(false);
  });
});
