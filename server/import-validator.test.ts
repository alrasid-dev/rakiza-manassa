import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { analyzeExcelImport, suggestImportAction } from "./import-validator";

function workbookBuffer(rows: unknown[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المتعثرات");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("تحقق ملفات Excel", () => {
  it("يتعرف على سجل المتعثرات المنظم قبل إدخاله", () => {
    const buffer = workbookBuffer([["تصنيف التعثر", "تاريخ نشوء التعثر", "حالة المعالجة"], ["صلاحية نظام", "2026-08-14", "تحت المتابعة"]]);
    const analysis = analyzeExcelImport(buffer);
    expect(analysis).toMatchObject({ template: "delay_register", rowCount: 1, status: "validated" });
    expect(suggestImportAction(analysis)).toMatchObject({ action: "schedule_delay_follow_up", requiresConfirmation: true });
  });

  it("يبقي القوالب غير المعروفة قيد المراجعة ولا يستوردها تلقائياً", () => {
    const buffer = workbookBuffer([["حقل غير معتمد"], ["قيمة"]]);
    expect(analyzeExcelImport(buffer)).toMatchObject({ template: "unknown", status: "requires_review" });
  });
});
