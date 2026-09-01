import * as XLSX from "xlsx";

export type PerformanceReportTaskCandidate = { title: string; source: "word" | "excel" };

const MAX_CANDIDATES = 50;

function normalize(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanTitle(value: unknown) {
  return normalize(value).replace(/^(?:[-–—•▪●*]+|\d+[.)-])\s*/, "").slice(0, 500);
}

function deduplicate(candidates: PerformanceReportTaskCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter(candidate => {
    const key = candidate.title.toLocaleLowerCase("ar");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_CANDIDATES);
}

export function extractPerformanceTasksFromWordText(text: string): PerformanceReportTaskCandidate[] {
  const candidates = text.split(/\r?\n|[؛;]+/)
    .map(cleanTitle)
    .filter(line => line.length >= 8)
    .filter(line => !/^(تقرير|التاريخ|القسم|إعداد|ملخص)(?:\s|$)/i.test(line))
    .map(title => ({ title, source: "word" as const }));
  return deduplicate(candidates);
}

export function extractPerformanceTasksFromExcel(content: Buffer): PerformanceReportTaskCandidate[] {
  const workbook = XLSX.read(content, { type: "buffer", cellDates: true, bookVBA: false });
  const allCandidates: PerformanceReportTaskCandidate[] = [];
  for (const name of workbook.SheetNames.slice(0, 10)) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
    const headerIndex = rows.findIndex(row => row.some(cell => normalize(cell)));
    if (headerIndex < 0) continue;
    const headers = rows[headerIndex]!.map(cell => normalize(cell));
    const taskColumn = headers.findIndex(header => /(المهمة|الإجراء|التوصية|المطلوب|الملاحظة|المعاملة)/.test(header));
    if (taskColumn < 0) continue;
    for (const row of rows.slice(headerIndex + 1)) {
      const title = cleanTitle(row[taskColumn]);
      if (title.length >= 4) allCandidates.push({ title, source: "excel" });
    }
  }
  return deduplicate(allCandidates);
}

export function distributeAcrossAvailableStaff<T extends { id: number; openWorkload: number }>(candidates: PerformanceReportTaskCandidate[], staff: T[]) {
  const loads = staff.map(member => ({ ...member }));
  const assignments: Array<{ candidate: PerformanceReportTaskCandidate; assigneeId: number }> = [];
  for (const candidate of candidates) {
    const assignee = loads.sort((a, b) => a.openWorkload - b.openWorkload || a.id - b.id)[0];
    if (!assignee) break;
    assignments.push({ candidate, assigneeId: assignee.id });
    assignee.openWorkload += 1;
  }
  return assignments;
}
