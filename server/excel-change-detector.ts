import { createHash } from "node:crypto";
import * as XLSX from "xlsx";
import type { ImportTemplate } from "./import-validator";

export type ExcelChangeCandidate = {
  sourceKey: string;
  fingerprint: string;
  title: string;
  relatedName?: string;
  summary: string;
};

const clean = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");

function namedRows(content: Buffer) {
  const workbook = XLSX.read(content, { type: "buffer", cellDates: true, bookVBA: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
  if (!sheet) return [] as Record<string, string>[];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
  const headerIndex = matrix.findIndex(row => row.some(cell => clean(cell)));
  if (headerIndex < 0) return [];
  const headers = matrix[headerIndex]!.map(clean);
  return matrix.slice(headerIndex + 1).map(row => Object.fromEntries(headers.map((header, index) => [header, clean(row[index])]))).filter(row => Object.values(row).some(Boolean));
}

function first(row: Record<string, string>, keys: string[]) {
  return keys.map(key => row[key]).find(Boolean) || "";
}

export function detectExcelChangeCandidates(content: Buffer, template: ImportTemplate): ExcelChangeCandidate[] {
  if (template !== "delay_register" && template !== "weekly_follow_up") return [];
  return namedRows(content).map(row => {
    const title = first(row, ["عنوان المهمة أو المعاملة", "المهمة", "تصنيف التعثر", "عنوان التعثر"]) || "تحديث وارد من ملف Excel";
    const reference = first(row, ["رقم المرجع", "الرقم المرجعي", "رقم المعاملة", "مرجع"]);
    const relatedName = first(row, ["الملازم القضائي", "اسم الملازم القضائي", "الموظف المختص1", "الموظف المختص"]);
    const summary = Object.entries(row).filter(([, value]) => value).slice(0, 12).map(([key, value]) => `${key}: ${value}`).join(" | ");
    const sourceKey = `${template}:${reference || title}:${relatedName || "unassigned"}`.slice(0, 255);
    const fingerprint = createHash("sha256").update(summary).digest("hex");
    return { sourceKey, fingerprint, title, relatedName: relatedName || undefined, summary };
  });
}
