import * as XLSX from "xlsx";

function normalized(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function retainJudicialTraineeRows(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, bookVBA: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("لا يحتوي المصدر المرتبط على ورقة عمل قابلة للقراءة.");
  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName]!, { header: 1, defval: "", raw: false });
  const headerIndex = rows.findIndex(row => row.some(cell => normalized(cell)));
  if (headerIndex < 0) throw new Error("لا يحتوي المصدر المرتبط على صف عناوين.");
  const headerRow = rows[headerIndex]!;
  const traineeColumn = headerRow.findIndex(cell => normalized(cell).includes("ملازم"));
  if (traineeColumn < 0) throw new Error("يجب أن يتضمن المصدر المرتبط عموداً يعرّف الملازم القضائي.");
  const retainedRows = rows.slice(headerIndex + 1).filter(row => Boolean(normalized(row[traineeColumn])));
  const outputWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWorkbook, XLSX.utils.aoa_to_sheet([headerRow, ...retainedRows]), sheetName);
  return {
    content: XLSX.write(outputWorkbook, { type: "buffer", bookType: "xlsx" }) as Buffer,
    retainedRows: retainedRows.length,
    skippedRows: Math.max(0, rows.length - headerIndex - 1 - retainedRows.length),
  };
}
