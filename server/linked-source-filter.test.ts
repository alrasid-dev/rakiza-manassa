import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { retainJudicialTraineeRows } from "./linked-source-filter";

function sourceBuffer() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["تصنيف التعثر", "تاريخ نشوء التعثر", "حالة المعالجة", "اسم الملازم القضائي"],
    ["تأخر إجراء", "2026-08-14", "تحت المتابعة", "ملازم أول"],
    ["إجراء إداري", "2026-08-14", "تحت المتابعة", ""],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "المصدر");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("فلترة مصدر الملازمين المرتبط", () => {
  it("تحتفظ بصفوف الملازمين وتتجاهل الصفوف غير المرتبطة بملازم قضائي", () => {
    const result = retainJudicialTraineeRows(sourceBuffer());
    expect(result).toMatchObject({ retainedRows: 1, skippedRows: 1 });
  });
});
