import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, BarChart3, BellRing, Building2, CalendarDays, ClipboardCheck, Download, FileBarChart2, ImageDown, ListChecks, MessageCircle, Play, Scale, Settings2, ShieldAlert, ShieldCheck, UsersRound } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardCustomizationDialog, defaultDashboardPreferences, normalizeDashboardPreferences, type DashboardPreferenceState } from "@/components/DashboardCustomizationDialog";
import { trpc } from "@/lib/trpc";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const branches = [
  ["رئاسة المحكمة", "مكتب رئيس المحكمة والرئيس المساعد ومكتبه", Building2],
  ["شؤون القضاة", "القضاة وموظفو شؤون القضاة", Scale],
  ["شؤون الملازمين", "الملازمون القضائيون وموظفو شؤون الملازمين", ShieldCheck],
  ["الأمانة العامة", "أمين المحكمة والأمين المساعد وموظفو الأمانة", UsersRound],
  ["الدعاوى والأحكام", "تسليم الأحكام وخدمات المستفيدين", ClipboardCheck],
  ["الباحثون وأمانة السر", "الباحثون وأمانة السر ووحدات القضايا والأحكام", ListChecks],
  ["مراقبة الأداء", "تقارير الأقسام والتحقق من المهام", FileBarChart2],
] as const;

type Metrics = { scope?: "unit"; profiles?: number; openDelays?: number; overdueDelays?: number; dueTasks?: number; openTasks?: number; overdueTasks?: number; unreadNotifications?: number };

type DepartmentPerformanceRow = { unitId: number; unitName: string; total: number; completed: number; overdue: number; open: number; completionRate: number; overdueRate: number };

type DashboardTaskFilter = "all" | "overdue" | "due_soon" | "completed";
type DashboardTask = { id: number; title: string; status: string; priority?: "normal" | "high" | "critical"; dueAt: Date | string | number; scheduledAt?: Date | string | number | null; scheduledFor?: Date | string | number | null; assigneeProfileId?: number | null; unitName?: string | null; description?: string | null };
type TeamMember = { id: number; fullName: string; jobTitle?: string | null; unitName?: string | null; status?: "active" | "on_leave" | "inactive" | "pending_review" };
export function dashboardTaskVisualState(task: DashboardTask, now = Date.now()): "completed" | "overdue" | "due_soon" | "normal" {
  if (task.status === "completed") return "completed";
  const dueAt = new Date(task.dueAt).getTime();
  if (task.status === "overdue" || dueAt <= now) return "overdue";
  if (dueAt - now <= 24 * 60 * 60 * 1000) return "due_soon";
  return "normal";
}
export function dashboardTaskMatchesFilter(task: DashboardTask, filter: DashboardTaskFilter, now = Date.now()) {
  if (filter === "all") return true;
  return dashboardTaskVisualState(task, now) === filter;
}
export function dashboardPriorityBadge(priority: DashboardTask["priority"] = "normal") {
  return ({ normal: { label: "عادية", className: "bg-[#e6eee5] text-[#486455]" }, high: { label: "أولوية عالية", className: "bg-[#f5edd8] text-[#78612f]" }, critical: { label: "حرجة", className: "bg-[#f8e3de] text-[#9d4034]" } } as const)[priority ?? "normal"];
}
export function dashboardDeadlineBadge(task: DashboardTask, now = Date.now()) {
  const visual = dashboardTaskVisualState(task, now);
  return visual === "overdue" ? { label: "متأخرة", className: "bg-[#f8e6e1] text-[#a8493b]" } : visual === "due_soon" ? { label: "قريبة الموعد", className: "bg-[#f5edd8] text-[#80642b]" } : visual === "completed" ? { label: "مكتملة", className: "bg-[#e4f0e4] text-[#2d684a]" } : { label: "ضمن المسار", className: "bg-[#e4eee5] text-[#35634c]" };
}
export function newlyCompletedDashboardTaskIds(tasks: DashboardTask[], previousStatuses: Map<number, string>) {
  return tasks.filter(task => task.status === "completed" && previousStatuses.has(task.id) && previousStatuses.get(task.id) !== "completed").map(task => task.id);
}
export const dashboardCompletionMotionClass = (isJustCompleted: boolean) => isJustCompleted ? "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-300 motion-safe:ease-out motion-reduce:animate-none" : "";
export const stateTone = (late = 0, due = 0) => late > 0 ? "bg-[#f8e6e1] text-[#963e33]" : due > 0 ? "bg-[#f5edd8] text-[#80642b]" : "bg-[#e2eee3] text-[#2d684a]";
export const stateLabel = (late = 0, due = 0) => late > 0 ? "يحتاج تدخلاً" : due > 0 ? "قريب الاستحقاق" : "ضمن المسار";
export const formatUnreadBadgeCount = (count = 0) => count > 99 ? "99+" : String(Math.max(0, count));
export const dashboardMetricIconSlotClass = "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-current/15 bg-current/10";
function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof ListChecks; tone: string }) {
  return <article className={`rounded-2xl p-5 shadow-[0_10px_25px_rgba(36,58,50,0.05)] ${tone}`}><div className="flex items-start justify-between"><Icon className="h-5 w-5 opacity-80" /><span className="text-3xl font-bold">{value}</span></div><p className="mt-7 text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-5 opacity-75">{note}</p></article>;
}

function ReferenceMetric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof ListChecks; tone: string }) {
  return <article className={`relative overflow-hidden rounded-xl border px-3 py-2.5 shadow-[0_5px_15px_rgba(36,67,51,0.045)] ${tone}`}><span className="absolute inset-y-0 right-0 w-1 bg-current opacity-35" aria-hidden="true" /><div className="flex items-center justify-between gap-2"><span className={dashboardMetricIconSlotClass}><Icon className="rakiza-olive-icon h-4 w-4" strokeWidth={2} aria-hidden="true" /></span><div className="min-w-0 text-left"><p className="text-xl font-black tracking-tight">{value}</p><p className="mt-0.5 truncate text-[11px] font-bold">{label}</p></div></div><p className="mt-2 border-t border-current/10 pt-1.5 truncate text-[10px] font-semibold opacity-75">{note}</p></article>;
}

function DashboardTaskRow({ task, onOpen, onStart, onComplete, onComment, onReassignment, onObstacle, canStart, canOperate, canReportObstacle, actionPending, isJustCompleted }: { task: DashboardTask; onOpen: () => void; onStart: () => void; onComplete: () => void; onComment: () => void; onReassignment: () => void; onObstacle: () => void; canStart: boolean; canOperate: boolean; canReportObstacle: boolean; actionPending: boolean; isJustCompleted: boolean }) {
  const visual = dashboardTaskVisualState(task);
  const tone = visual === "overdue" ? "bg-[#f8e6e1] text-[#a8493b]" : visual === "due_soon" ? "bg-[#f5edd8] text-[#80642b]" : visual === "completed" ? "bg-[#e4f0e4] text-[#2d684a]" : "bg-[#e4eee5] text-[#35634c]";
  const priorityBadge = dashboardPriorityBadge(task.priority);
  const deadlineBadge = dashboardDeadlineBadge(task);
  const dueTime = new Date(task.dueAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const scheduledAt = task.scheduledFor ?? task.scheduledAt;
  const scheduledTime = scheduledAt ? new Date(scheduledAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : null;
  const contextLine = task.unitName || task.description || "مهمة مرتبطة بنطاقك";
  const completionMotion = dashboardCompletionMotionClass(isJustCompleted);
  return <article data-completion-transition={isJustCompleted ? "true" : "false"} className={`grid w-full grid-cols-[2.4rem_minmax(0,1fr)_4.5rem] items-center gap-2 px-1 py-3 text-right transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[#edf1ea] motion-reduce:transition-none md:grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_6rem_17rem] ${isJustCompleted ? "rounded-xl bg-[#e5f0e5] shadow-[0_0_0_3px_rgba(63,115,84,0.14)]" : ""}`}><span className="sr-only" aria-live="polite">{isJustCompleted ? "اكتملت المهمة وتم تحديث الشارة." : ""}</span><button type="button" onClick={onOpen} className="contents text-right"><span className={`grid h-9 w-9 place-items-center rounded-lg transition-[background-color,transform] duration-300 ease-out motion-reduce:transition-none ${tone} ${completionMotion}`}>{visual === "completed" ? <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> : <ListChecks className="h-4 w-4" aria-hidden="true" />}</span><span className="min-w-0"><span className="block truncate text-sm font-bold text-[#304b40]">{task.title}</span><span className="mt-1 block truncate text-[11px] text-[#66786e]">{contextLine}</span><span className="mt-1.5 flex flex-wrap gap-1 md:hidden"><span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${priorityBadge.className}`}>{priorityBadge.label}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${deadlineBadge.className} ${completionMotion}`}>{deadlineBadge.label}</span></span></span><span className="hidden text-center text-[10px] leading-5 text-[#718078] md:block"><span className="block font-bold text-[#476358]">{scheduledTime || dueTime}</span><span className="block">{scheduledTime ? `حتى ${dueTime}` : "موعد الاستحقاق"}</span></span><span className="hidden justify-self-center gap-1 md:flex md:flex-col"><span className={`rounded-full px-2 py-1 text-center text-[10px] font-black ${priorityBadge.className}`}>{priorityBadge.label}</span><span className={`rounded-full px-2 py-1 text-center text-[10px] font-black ${deadlineBadge.className} ${completionMotion}`}>{deadlineBadge.label}</span></span></button><span className="col-span-full mt-1 flex flex-wrap items-center gap-1.5 md:col-span-1 md:col-start-5 md:mt-0 md:justify-self-end">{canOperate && canStart && <button type="button" disabled={actionPending} onClick={onStart} className="inline-flex items-center gap-1 rounded-lg bg-[#2d6b4f] px-2.5 py-2 text-[10px] font-black text-white shadow-[0_5px_12px_rgba(45,107,79,0.18)] disabled:opacity-60"><Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />{actionPending ? "جارٍ البدء…" : "بدء التنفيذ"}</button>}{canOperate && task.status === "in_progress" && <button type="button" onClick={onComplete} className="inline-flex items-center gap-1 rounded-lg bg-[#3f7354] px-2.5 py-2 text-[10px] font-black text-white"><ClipboardCheck className="h-3.5 w-3.5" />تمت المعالجة</button>}{canOperate && !["completed", "cancelled", "under_review"].includes(task.status) && <button type="button" onClick={onComment} className="inline-flex items-center gap-1 rounded-lg border border-[#b8d1bd] bg-[#eef5ec] px-2.5 py-2 text-[10px] font-black text-[#2d684a]"><MessageCircle className="h-3.5 w-3.5" />إضافة تعليق</button>}{canOperate && !["completed", "cancelled", "under_review"].includes(task.status) && <button type="button" onClick={onReassignment} className="inline-flex items-center gap-1 rounded-lg border border-[#ddcfaa] bg-[#f6f0df] px-2.5 py-2 text-[10px] font-black text-[#80642b]"><ArrowLeft className="h-3.5 w-3.5" />طلب سحب المهمة</button>}{canReportObstacle && <button type="button" aria-label="يوجد عائق" onClick={onObstacle} className="inline-flex items-center gap-1 rounded-lg border border-[#e6c8bf] bg-[#f9ece8] px-2.5 py-2 text-[10px] font-black text-[#a64b3c]"><ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />يوجد عائق</button>}<button type="button" onClick={onOpen} className="inline-flex items-center gap-1 rounded-lg border border-[#c6d4c7] px-2.5 py-2 text-[10px] font-black text-[#31594d]">التفاصيل<ArrowLeft className="h-3.5 w-3.5" /></button></span></article>;
}

function formatDashboardGregorianDate(value = new Date()) {
  return value.toLocaleDateString("ar-SA-u-ca-gregory", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDashboardHijriDate(value = new Date()) {
  return value.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" });
}

function formatDashboardTime(value = new Date()) {
  return value.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

export function profileInitials(name: string) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("");
  return initials || "ف";
}

export function teamStatusLabel(status?: TeamMember["status"]) {
  if (status === "on_leave") return "في إجازة";
  if (status === "inactive") return "غير نشط";
  if (status === "pending_review") return "قيد المراجعة";
  return "نشط";
}

function isSameDashboardDay(value: Date | string | number, reference = new Date()) {
  const date = new Date(value);
  return date.toLocaleDateString("en-CA") === reference.toLocaleDateString("en-CA");
}

function DepartmentPerformanceChart({ data, isLoading, period, setPeriod, priority, setPriority, jobTitle, setJobTitle }: { data: DepartmentPerformanceRow[]; isLoading: boolean; period: "daily" | "weekly" | "monthly"; setPeriod: React.Dispatch<React.SetStateAction<"daily" | "weekly" | "monthly">>; priority: "" | "normal" | "high" | "critical"; setPriority: React.Dispatch<React.SetStateAction<"" | "normal" | "high" | "critical">>; jobTitle: string; setJobTitle: React.Dispatch<React.SetStateAction<string>> }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [compareA, setCompareA] = useState<number | null>(null);
  const [compareB, setCompareB] = useState<number | null>(null);
  const detailsProcedure = trpc.court.dashboardDepartmentPerformanceDetails;
  const details = detailsProcedure?.useQuery ? detailsProcedure.useQuery({ unitId: selectedUnitId ?? 0, period, priority: priority || undefined, jobTitle: jobTitle.trim() || undefined }, { enabled: Boolean(selectedUnitId) }) : { data: [], isLoading: false } as { data: Array<{ profileId: number; fullName: string; jobTitle?: string | null; completionRate: number; completed: number; overdue: number; open: number }>; isLoading: boolean };
  const chartData = data.slice(0, 12).map(item => ({ unitId: item.unitId, name: item.unitName.length > 20 ? `${item.unitName.slice(0, 20)}…` : item.unitName, completionRate: item.completionRate, overdueRate: item.overdueRate, total: item.total }));
  const summary = data.length ? `أعلى إنجاز حالياً: ${data[0].unitName} بنسبة ${data[0].completionRate}%. ${data[0].overdueRate > 20 ? "تظهر نسبة تأخر تستدعي مراجعة توزيع المهام ومواعيد الاستحقاق." : "يُقترح تثبيت الممارسات الناجحة ومراجعة الأقسام التالية في الترتيب."}` : "لا توجد بيانات كافية لإعداد ملخص للفترة والفلاتر الحالية.";
  const compareData = [compareA, compareB].filter((id): id is number => id !== null).map(id => data.find(item => item.unitId === id)).filter(Boolean) as DepartmentPerformanceRow[];
  const comparisonProcedure = trpc.court.dashboardDepartmentPerformanceComparison;
  const comparison = comparisonProcedure?.useQuery ? comparisonProcedure.useQuery({ unitIds: [compareA ?? 0, compareB ?? 0], period, priority: priority || undefined, jobTitle: jobTitle.trim() || undefined }, { enabled: compareA !== null && compareB !== null && compareA !== compareB }) : { data: undefined, isLoading: false } as { data?: { current?: Array<DepartmentPerformanceRow[]>; previous?: Array<DepartmentPerformanceRow[]> }; isLoading: boolean };
  const compareSummary = (index: number) => { const current = comparison.data?.current?.[index] ?? []; const previous = comparison.data?.previous?.[index] ?? []; const currentRate = current.length ? Math.round(current.reduce((sum, item) => sum + item.completionRate, 0) / current.length) : 0; const previousRate = previous.length ? Math.round(previous.reduce((sum, item) => sum + item.completionRate, 0) / previous.length) : 0; return { currentRate, previousRate, delta: currentRate - previousRate }; };
  const exportComparison = (format: "pdf" | "excel") => { if (!compareData.length) return; const rows = compareData.map((item, index) => ({ name: item.unitName, current: item.completionRate, previous: compareSummary(index).previousRate, delta: compareSummary(index).delta })); if (format === "excel") { const html = `<table dir="rtl"><tr><th>القسم</th><th>الإنجاز الحالي</th><th>الإنجاز السابق</th><th>التغير</th></tr>${rows.map(row => `<tr><td>${row.name}</td><td>${row.current}%</td><td>${row.previous}%</td><td>${row.delta}%</td></tr>`).join("")}</table>`; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([`<html><meta charset="utf-8">${html}</html>`], { type: "application/vnd.ms-excel" })); link.download = "مقارنة-الأقسام.xls"; link.click(); URL.revokeObjectURL(link.href); return; } const pdf = new jsPDF("landscape", "mm", "a4"); pdf.setFontSize(16); pdf.text("مقارنة أداء الأقسام", 280, 14, { align: "right" }); pdf.setFontSize(11); rows.forEach((row, index) => pdf.text(`${row.name}: الحالي ${row.current}% | السابق ${row.previous}% | التغير ${row.delta > 0 ? "+" : ""}${row.delta}%`, 280, 28 + index * 10, { align: "right" })); pdf.save("مقارنة-الأقسام.pdf"); };
  const employeeRecommendation = (item: { completionRate: number; overdue: number; open: number }) => item.overdue > 0 ? `يوصى بمراجعة ${item.overdue} مهمة متأخرة وترتيب أولويات الاستحقاقات القادمة.` : item.completionRate >= 80 ? "إنجاز مستقر؛ يوصى بالمحافظة على الوتيرة ومشاركة الممارسات الناجحة." : item.open > 0 ? `يوصى بتقسيم ${item.open} مهمة مفتوحة إلى خطوات قصيرة مع متابعة موعد الاستحقاق.` : "يوصى بتحديد هدف إنجاز واضح للفترة القادمة.";
  const recommendationProcedure = trpc.court.sendPerformanceRecommendation;
  const sendRecommendation = recommendationProcedure?.useMutation ? recommendationProcedure.useMutation() : { isPending: false, mutate: (_input: { profileId: number; unitId: number; recommendation: string; delivery: "dashboard_notification" }) => undefined };
  const exportPng = () => { const svg = chartRef.current?.querySelector("svg"); if (!svg) return; const source = new XMLSerializer().serializeToString(svg); const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" })); const image = new Image(); image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 620; const context = canvas.getContext("2d"); if (context) { context.fillStyle = "#fffdf8"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 20, 20, 1160, 580); const link = document.createElement("a"); link.download = "ترتيب-الأقسام.png"; link.href = canvas.toDataURL("image/png"); link.click(); } URL.revokeObjectURL(url); }; image.src = url; };
  const exportPdf = () => { const svg = chartRef.current?.querySelector("svg"); if (!svg) return; const source = new XMLSerializer().serializeToString(svg); const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" })); const image = new Image(); image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 620; const context = canvas.getContext("2d"); if (context) { context.fillStyle = "#fffdf8"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 20, 20, 1160, 580); const pdf = new jsPDF("landscape", "mm", "a4"); pdf.setFontSize(16); pdf.text("ترتيب إنجاز الأقسام", 280, 12, { align: "right" }); pdf.addImage(canvas.toDataURL("image/png"), "PNG", 8, 18, 281, 145); pdf.save("ترتيب-الأقسام.pdf"); } URL.revokeObjectURL(url); }; image.src = url; };
  return <section className="mt-6 rounded-[1.6rem] border border-[#e9e2d7] bg-white p-5 shadow-[0_10px_32px_rgba(30,51,42,0.045)] sm:p-7" dir="rtl"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#006c35]" /><p className="text-xs font-bold text-[#b18448]">تحليل بصري للمحكمة</p></div><h2 className="mt-1 text-xl font-bold text-[#12352f]">ترتيب الأقسام وإنجازها</h2><p className="mt-2 text-xs leading-6 text-[#65766d]">المؤشرات محسوبة من المهام الفعلية خلال الفترة المختارة. الترتيب إرشادي ولا يستبدل التقييم الإداري.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={exportPng} disabled={!chartData.length} className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d8] px-3 py-2 text-xs font-bold text-[#31594d] disabled:opacity-40"><ImageDown className="h-4 w-4" />صورة</button><button type="button" onClick={exportPdf} disabled={!chartData.length} className="inline-flex items-center gap-2 rounded-xl bg-[#006c35] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" />PDF</button></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><select aria-label="فترة الرسم" value={period} onChange={event => setPeriod(event.target.value as "daily" | "weekly" | "monthly")} className="h-10 rounded-xl border border-[#dcd4c7] bg-[#fbfaf6] px-3 text-sm"><option value="daily">يومي</option><option value="weekly">أسبوعي</option><option value="monthly">شهري</option></select><select aria-label="نوع المهمة" value={priority} onChange={event => setPriority(event.target.value as "" | "normal" | "high" | "critical")} className="h-10 rounded-xl border border-[#dcd4c7] bg-[#fbfaf6] px-3 text-sm"><option value="">كل أنواع المهام</option><option value="normal">عادية</option><option value="high">عالية الأولوية</option><option value="critical">حرجة</option></select><input aria-label="المسمى الوظيفي" value={jobTitle} onChange={event => setJobTitle(event.target.value)} placeholder="فلترة بالمسمى الوظيفي" className="h-10 rounded-xl border border-[#dcd4c7] bg-[#fbfaf6] px-3 text-sm" /></div><div ref={chartRef} className="mt-5 h-[360px] w-full">{isLoading ? <p className="pt-14 text-center text-sm text-[#718078]">جارٍ تحديث مؤشرات الأقسام…</p> : chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 48 }} onClick={entry => { const item = entry as unknown as { activePayload?: Array<{ payload?: { unitId?: number } }> }; const unitId = item.activePayload?.[0]?.payload?.unitId; if (unitId) setSelectedUnitId(unitId); }}><CartesianGrid strokeDasharray="3 3" stroke="#e1e9e2" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={70} tick={{ fontSize: 11, fill: "#29463b" }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#60746a" }} /><Tooltip formatter={(value: number) => [`${value}%`, ""]} /><Legend verticalAlign="top" height={32} /><Bar dataKey="completionRate" name="نسبة الإنجاز" fill="#2d7655" radius={[5, 5, 0, 0]} /><Bar dataKey="overdueRate" name="نسبة التأخر" fill="#c77b5a" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[#d8e2d8] bg-[#fbfaf6] text-sm text-[#718078]">لا توجد مهام مطابقة للفلاتر الحالية.</div>}</div><div className="mt-5 rounded-2xl bg-[#f5f7f2] p-4 text-sm leading-7 text-[#31594d]"><strong>ملخص تحليلي:</strong> {summary}</div><div className="mt-5 rounded-2xl border border-[#e9e2d7] p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#006c35]" /><h3 className="text-sm font-bold text-[#12352f]">مقارنة قسمين</h3></div><p className="mt-1 text-xs text-[#718078]">اختر قسمين من نفس الفترة لمقارنة الإنجاز والتأخر جنباً إلى جنب، مع الاتجاه مقارنة بالفترة السابقة.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => exportComparison("excel")} disabled={compareData.length !== 2} className="rounded-xl border border-[#d8e2d8] px-3 py-2 text-xs font-bold text-[#31594d] disabled:opacity-40">تصدير Excel</button><button type="button" onClick={() => exportComparison("pdf")} disabled={compareData.length !== 2} className="rounded-xl bg-[#006c35] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">تصدير PDF</button></div><div className="mt-3 grid gap-3 md:grid-cols-2"><select aria-label="القسم الأول للمقارنة" value={compareA ?? ""} onChange={event => setCompareA(event.target.value ? Number(event.target.value) : null)} className="h-10 rounded-xl border border-[#dcd4c7] bg-[#fbfaf6] px-3 text-sm"><option value="">اختر القسم الأول</option>{data.map(item => <option key={item.unitId} value={item.unitId}>{item.unitName}</option>)}</select><select aria-label="القسم الثاني للمقارنة" value={compareB ?? ""} onChange={event => setCompareB(event.target.value ? Number(event.target.value) : null)} className="h-10 rounded-xl border border-[#dcd4c7] bg-[#fbfaf6] px-3 text-sm"><option value="">اختر القسم الثاني</option>{data.map(item => <option key={item.unitId} value={item.unitId}>{item.unitName}</option>)}</select></div>{compareData.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2">{compareData.map((item, index) => { const trend = compareSummary(index); return <div key={item.unitId} className="rounded-xl bg-[#fbfaf6] p-4"><p className="font-bold text-[#12352f]">{item.unitName}</p><p className="mt-2 text-sm text-[#31594d]">الإنجاز: {item.completionRate}% · التأخر: {item.overdueRate}%</p><p className={`mt-2 text-sm font-bold ${trend.delta > 0 ? "text-[#2d7655]" : trend.delta < 0 ? "text-[#b4513d]" : "text-[#718078]"}`}>{trend.delta > 0 ? "↑" : trend.delta < 0 ? "↓" : "→"} {trend.delta > 0 ? "تحسن" : trend.delta < 0 ? "تراجع" : "ثبات"} {Math.abs(trend.delta)}% مقارنة بالفترة السابقة</p><p className="mt-1 text-xs text-[#718078]">مكتملة: {item.completed} · مفتوحة: {item.open} · إجمالي: {item.total}</p></div>})}</div>}</div>{selectedUnitId && <div role="dialog" aria-modal="true" className="mt-5 rounded-2xl border-2 border-[#d8e2d8] bg-[#fbfaf6] p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#b18448]">تفاصيل القسم</p><h3 className="mt-1 text-lg font-bold text-[#12352f]">{data.find(item => item.unitId === selectedUnitId)?.unitName}</h3></div><button type="button" onClick={() => setSelectedUnitId(null)} className="rounded-lg border border-[#dcd4c7] px-3 py-2 text-xs font-bold text-[#31594d]">إغلاق</button></div>{details.isLoading ? <p className="mt-4 text-sm text-[#718078]">جارٍ تحميل إنجاز الموظفين…</p> : details.data?.length ? <div className="mt-4 divide-y divide-[#e9e2d7]">{details.data.map((item, index) => <div key={item.profileId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span className="font-bold text-[#25473b]">{index + 1}. {item.fullName}<small className="mr-2 font-normal text-[#718078]">{item.jobTitle ?? "بدون مسمى"}</small></span><span className="text-[#31594d]">{item.completionRate}% إنجاز · {item.completed} مكتملة · {item.overdue} متأخرة</span><p className="mt-1 w-full text-xs leading-6 text-[#65766d]">توصية: {employeeRecommendation(item)}</p><button type="button" disabled={sendRecommendation.isPending} onClick={() => sendRecommendation.mutate({ profileId: item.profileId, unitId: selectedUnitId, recommendation: employeeRecommendation(item), delivery: "dashboard_notification" })} className="mt-2 rounded-lg border border-[#d8e2d8] px-3 py-2 text-xs font-bold text-[#31594d] disabled:opacity-40">{sendRecommendation.isPending ? "جارٍ الإرسال…" : "إرسال للموظف"}</button></div>)}</div> : <p className="mt-4 text-sm text-[#718078]">لا توجد مهام مطابقة لهذا القسم والفترة.</p>}</div>}</section>;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [unitId, setUnitId] = useState("");
  const [dashboardPeriod, setDashboardPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [dashboardPriority, setDashboardPriority] = useState<"" | "normal" | "high" | "critical">("");
  const [dashboardJobTitle, setDashboardJobTitle] = useState("");
  const [taskFilter, setTaskFilter] = useState<DashboardTaskFilter>("all");
  const [taskActionDialog, setTaskActionDialog] = useState<{ kind: "complete" | "comment" | "reassignment"; task: DashboardTask } | null>(null);
  const [taskActionNote, setTaskActionNote] = useState("");
  const [dashboardCustomizationOpen, setDashboardCustomizationOpen] = useState(false);
  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferenceState>(() => defaultDashboardPreferences());
  const [recentlyCompletedTaskIds, setRecentlyCompletedTaskIds] = useState<number[]>([]);
  const previousTaskStatuses = useRef<Map<number, string>>(new Map());
  const hasObservedTaskStatuses = useRef(false);
  const completionMotionTimeouts = useRef<Map<number, number>>(new Map());
  const permission = trpc.court.registration.myPermission.useQuery();
  const roles = trpc.court.myRoles.useQuery();
  const dashboard = trpc.court.dashboard.useQuery();
  const taskListProcedure = trpc.court.tasks?.list;
  const dashboardTasks = taskListProcedure?.useQuery ? taskListProcedure.useQuery() : { data: [] as DashboardTask[], isLoading: false, refetch: async () => undefined };
  const dashboardPreferencesProcedure = trpc.court.dashboardPreferences;
  const savedDashboardPreferences = dashboardPreferencesProcedure?.mine?.useQuery ? dashboardPreferencesProcedure.mine.useQuery() : { data: undefined as DashboardPreferenceState | undefined, isLoading: false };
  const saveDashboardPreferences = dashboardPreferencesProcedure?.update?.useMutation ? dashboardPreferencesProcedure.update.useMutation({ onSuccess: preferences => { setDashboardPreferences(preferences as DashboardPreferenceState); setDashboardCustomizationOpen(false); toast.success("تم حفظ تخصيص لوحة القيادة."); }, onError: error => toast.error(error.message) }) : { mutate: (_preferences: DashboardPreferenceState) => toast.error("خدمة تخصيص اللوحة غير متاحة حالياً."), isPending: false };
  const currentProfileProcedure = trpc.court.people?.self;
  const currentProfile = currentProfileProcedure?.useQuery ? currentProfileProcedure.useQuery() : { data: undefined as { id: number } | undefined };
  const acknowledgeProcedure = trpc.court.tasks?.acknowledge;
  const startTask = acknowledgeProcedure?.useMutation ? acknowledgeProcedure.useMutation({ onSuccess: () => { void dashboardTasks.refetch(); toast.success("تم تسجيل بدء تنفيذ المهمة."); }, onError: error => toast.error(error.message) }) : { isPending: false, mutate: (_input: { taskId: number }) => toast.error("خدمة بدء المهمة غير متاحة حالياً.") };
  const submitForReviewProcedure = trpc.court.tasks?.submitForReview;
  const submitForReview = submitForReviewProcedure?.useMutation ? submitForReviewProcedure.useMutation({ onSuccess: () => { void dashboardTasks.refetch(); setTaskActionDialog(null); toast.success("تمت المعالجة وأُرسلت المهمة للمدير للمراجعة."); }, onError: error => toast.error(error.message) }) : { isPending: false, mutate: (_input: { taskId: number }) => toast.error("خدمة إتمام المهمة غير متاحة حالياً.") };
  const addProgressNoteProcedure = trpc.court.tasks?.addProgressNote;
  const addProgressNote = addProgressNoteProcedure?.useMutation ? addProgressNoteProcedure.useMutation({ onSuccess: () => { void dashboardTasks.refetch(); setTaskActionDialog(null); setTaskActionNote(""); toast.success("تمت إضافة التعليق إلى سجل المهمة."); }, onError: error => toast.error(error.message) }) : { isPending: false, mutate: (_input: { taskId: number; note: string }) => toast.error("خدمة التعليقات غير متاحة حالياً.") };
  const requestExceptionProcedure = trpc.court.tasks?.exceptions?.request;
  const requestReassignment = requestExceptionProcedure?.useMutation ? requestExceptionProcedure.useMutation({ onSuccess: () => { void dashboardTasks.refetch(); setTaskActionDialog(null); setTaskActionNote(""); toast.success("تم إرسال طلب سحب المهمة للمدير المباشر."); }, onError: error => toast.error(error.message) }) : { isPending: false, mutate: (_input: { taskId: number; kind: "reassignment"; reason: string }) => toast.error("خدمة طلب إعادة الإسناد غير متاحة حالياً.") };
  const unreadCountProcedure = trpc.court.communications?.conversations?.unreadCount;
  const unreadConversations = unreadCountProcedure?.useQuery ? unreadCountProcedure.useQuery(undefined, { refetchInterval: 60_000 }) : { data: 0, isLoading: false };
  const conversationsProcedure = trpc.court.communications?.conversations?.list;
  const conversations = conversationsProcedure?.useQuery ? conversationsProcedure.useQuery() : { data: [] as Array<{ conversation: { id: number; conversationType: string; subject?: string | null } }>, isLoading: false };
  const authMeProcedure = trpc.auth?.me;
  const authMe = authMeProcedure?.useQuery ? authMeProcedure.useQuery() : { data: undefined, isLoading: false };
  const peopleProcedure = trpc.court.people?.list;
  const teamPeople = peopleProcedure?.useQuery ? peopleProcedure.useQuery() : { data: [] as TeamMember[], isLoading: false };
  const leadershipRoles = roles.data ?? [];
  const leadership = permission.data === "full_control" || permission.data === "general_view" || Boolean(leadershipRoles.some(role => role === "court_president" || role === "assistant_president"));
  const canManageTaskActions = permission.data === "full_control" || Boolean(leadershipRoles.some(role => role === "court_president" || role === "assistant_president" || role === "court_secretary" || role === "department_manager" || role === "trainee_affairs_manager"));
  const metrics = (dashboard.data ?? {}) as Metrics;
  const manager = !leadership && metrics.scope === "unit";
  const overdueTasks = metrics.overdueTasks ?? 0;
  const dueTasks = metrics.dueTasks ?? 0;
  const departmentPerformanceProcedure = trpc.court.dashboardDepartmentPerformance;
  const departmentPerformance = departmentPerformanceProcedure?.useQuery ? departmentPerformanceProcedure.useQuery({ period: dashboardPeriod, priority: dashboardPriority || undefined, jobTitle: dashboardJobTitle.trim() || undefined }, { enabled: leadership }) : { data: [], isLoading: false } as { data: DepartmentPerformanceRow[]; isLoading: boolean };
  const number = (value: number | undefined) => dashboard.isLoading ? "…" : String(value ?? 0);
  const allDashboardTasks = (dashboardTasks.data ?? []) as DashboardTask[];
  useEffect(() => {
    if (savedDashboardPreferences.data) setDashboardPreferences(normalizeDashboardPreferences(savedDashboardPreferences.data));
  }, [savedDashboardPreferences.data]);
  const todayTasks = allDashboardTasks.filter(task => isSameDashboardDay(task.dueAt));
  const dueSoonTaskCount = allDashboardTasks.filter(task => dashboardTaskVisualState(task) === "due_soon").length;
  const inProgressTaskCount = allDashboardTasks.filter(task => ["in_progress", "processing"].includes(task.status)).length;
  const reviewTaskCount = allDashboardTasks.filter(task => ["under_review", "pending"].includes(task.status)).length;
  const taskSource = taskFilter === "all" ? (todayTasks.length ? todayTasks : allDashboardTasks) : allDashboardTasks.filter(task => dashboardTaskMatchesFilter(task, taskFilter));
  const visibleDashboardTasks = taskSource.slice(0, 8);
  useEffect(() => {
    if (dashboardTasks.isLoading) return;
    const currentStatuses = new Map(allDashboardTasks.map(task => [task.id, task.status]));
    if (!hasObservedTaskStatuses.current) {
      previousTaskStatuses.current = currentStatuses;
      hasObservedTaskStatuses.current = true;
      return;
    }
    const newlyCompletedIds = newlyCompletedDashboardTaskIds(allDashboardTasks, previousTaskStatuses.current);
    previousTaskStatuses.current = currentStatuses;
    if (!newlyCompletedIds.length) return;
    setRecentlyCompletedTaskIds(ids => Array.from(new Set(ids.concat(newlyCompletedIds))));
    newlyCompletedIds.forEach(taskId => {
      const existingTimeout = completionMotionTimeouts.current.get(taskId);
      if (existingTimeout) window.clearTimeout(existingTimeout);
      completionMotionTimeouts.current.set(taskId, window.setTimeout(() => {
        setRecentlyCompletedTaskIds(ids => ids.filter(id => id !== taskId));
        completionMotionTimeouts.current.delete(taskId);
      }, 560));
    });
  }, [allDashboardTasks, dashboardTasks.isLoading]);
  useEffect(() => () => {
    completionMotionTimeouts.current.forEach(timeout => window.clearTimeout(timeout));
  }, []);
  const overdueAlertTask = allDashboardTasks.find(task => dashboardTaskVisualState(task) === "overdue");
  const dueSoonAlertTask = allDashboardTasks.find(task => dashboardTaskVisualState(task) === "due_soon");
  const alertTime = (task?: DashboardTask) => task ? new Date(task.dueAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "اليوم";
  const referenceAlerts = [
    overdueTasks > 0 ? { label: "مهمة متأخرة", detail: `${overdueTasks} مهمة تحتاج إجراءً أو متابعة`, time: alertTime(overdueAlertTask), tone: "text-[#a8493b]", dot: "bg-[#c85a4b]" } : null,
    dueTasks > 0 ? { label: "قرب موعد مهمة", detail: `${dueTasks} مهام قريبة من الاستحقاق`, time: alertTime(dueSoonAlertTask), tone: "text-[#8b6b25]", dot: "bg-[#d1a12f]" } : null,
    (unreadConversations.data ?? 0) > 0 ? { label: "رسائل غير مقروءة", detail: `${formatUnreadBadgeCount(unreadConversations.data)} رسالة في التواصل`, time: "الآن", tone: "text-[#2c6850]", dot: "bg-[#2f865a]" } : null,
  ].filter((item): item is { label: string; detail: string; time: string; tone: string; dot: string } => Boolean(item));
  const teamPreview = ((teamPeople.data ?? []) as TeamMember[]).filter(profile => profile.status !== "inactive").slice(0, 3);
  const departmentConversation = conversations.data?.find(row => row.conversation.conversationType === "department")?.conversation;

  const isWidgetVisible = (widgetId: DashboardPreferenceState["widgetOrder"][number]) => !dashboardPreferences.hiddenWidgetIds.includes(widgetId);
  const dashboardCustomizer = <button type="button" onClick={() => setDashboardCustomizationOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-black text-white transition hover:bg-white/15"><Settings2 className="h-4 w-4 text-[#a8c98f]" />تخصيص لوحة القيادة</button>;
  return <DashboardLayout hideUtilityPrompts dashboardCustomization={dashboardCustomizer} navigationPreferences={dashboardPreferences}><section className="mx-auto max-w-[1240px]" dir="rtl">
    <section dir="ltr" className="mt-5 flex flex-col gap-4 border-b border-[#cdd7cc] pb-5 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
      <div dir="rtl" className="flex items-end gap-3 rounded-xl border border-[#cfd7ca] bg-[#f7f8f3] px-4 py-3 text-right shadow-[0_5px_15px_rgba(36,67,51,0.045)] lg:min-w-[15rem]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#687970]"><CalendarDays className="h-4 w-4 text-[#4a785a]" aria-hidden="true" /><span>{formatDashboardGregorianDate()}</span></div>
          <p className="mt-1 pr-6 text-[11px] font-semibold text-[#827e70]">{formatDashboardHijriDate()} · {formatDashboardTime()}</p>
        </div>
      </div>
      <div dir="rtl" className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button type="button" onClick={() => setLocation(leadership ? "/reports" : "/tasks")} className="inline-flex items-center gap-2 rounded-lg bg-[#2d6b4f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#245f43]">{leadership ? "التقرير الشامل" : "عرض المهام"}<ArrowLeft className="h-4 w-4" /></button>
      </div>
    </section>

    {isWidgetVisible("overview") && <section className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_16.5rem]" aria-label="ملخص حالات المهام والتنبيهات">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><ReferenceMetric label="مهام اليوم" value={number(todayTasks.length || metrics.openTasks)} note="المهام الظاهرة اليوم" icon={ListChecks} tone="border-[#c7d9c8] bg-[#e7f0e7] text-[#2d684a]" /><ReferenceMetric label="قرب موعدها" value={number(dueSoonTaskCount || dueTasks)} note="تحتاج مراجعة قبل الاستحقاق" icon={BellRing} tone="border-[#e2d3a5] bg-[#f5edd8] text-[#80642b]" /><ReferenceMetric label="بدأ التنفيذ" value={number(inProgressTaskCount)} note="قيد المعالجة الآن" icon={Settings2} tone="border-[#c6d8c7] bg-[#e4eee5] text-[#35634c]" /><ReferenceMetric label="بانتظار اعتمادي" value={number(reviewTaskCount)} note="تحت المراجعة أو الاعتماد" icon={ClipboardCheck} tone="border-[#d1dccd] bg-[#edf1e8] text-[#486455]" /><ReferenceMetric label="مهام متأخرة" value={number(overdueTasks)} note={overdueTasks ? "تحتاج إجراءً اليوم" : "لا يوجد تأخر"} icon={ClipboardCheck} tone="border-[#e2c9c0] bg-[#f8e6e1] text-[#a8493b]" /></div>
      <section className="rounded-xl border border-[#cfd7ca] bg-[#f7f8f3] px-3 py-2.5 shadow-[0_5px_15px_rgba(36,67,51,0.045)]" aria-label="التنبيهات المختصرة"><div className="flex items-center justify-between"><span className="text-[11px] font-black text-[#25463a]">تنبيهات سريعة</span><BellRing className="h-4 w-4 text-[#4a785a]" /></div>{referenceAlerts.length ? <div className="mt-1.5 space-y-1.5">{referenceAlerts.slice(0, 2).map(alert => <button type="button" key={alert.label} onClick={() => setLocation(alert.label === "رسائل غير مقروءة" ? "/messages" : "/tasks")} className="flex w-full items-center gap-2 text-right"><span className={`h-2 w-2 shrink-0 rounded-full ${alert.dot}`} /><span className={`min-w-0 flex-1 truncate text-[10px] font-bold ${alert.tone}`}>{alert.label}</span><span className="text-[10px] text-[#758279]">{alert.time}</span></button>)}</div> : <p className="mt-2 text-[10px] text-[#758279]">لا توجد تنبيهات عاجلة.</p>}</section>
    </section>}

    <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      {isWidgetVisible("tasks") && <section style={{ order: dashboardPreferences.widgetOrder.indexOf("tasks") }} className="min-h-[23rem] rounded-2xl border border-[#cfd7ca] bg-[#f8f8f3] p-4 shadow-[0_10px_26px_rgba(36,67,51,0.05)]" aria-label="مهامي اليوم">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#dce1d8] pb-3"><div><p className="text-xs font-bold text-[#4a785a]">مسار التنفيذ</p><h2 className="mt-1 text-xl font-black text-[#25463a]">مهامي اليوم</h2></div><div className="flex items-center gap-2"><select aria-label="تصفية المهام حسب الحالة" value={taskFilter} onChange={event => setTaskFilter(event.target.value as DashboardTaskFilter)} className="h-9 rounded-lg border border-[#cbd4c8] bg-[#eff1ea] px-2 text-xs font-bold text-[#31594d]"><option value="all">كل المهام</option><option value="overdue">متأخرة</option><option value="due_soon">قريبة</option><option value="completed">مكتملة</option></select><button type="button" onClick={() => setLocation("/tasks")} className="text-xs font-bold text-[#2d6b4f] hover:text-[#31594d]">عرض الكل</button></div></div>
        {dashboardTasks.isLoading ? <p className="py-10 text-center text-sm text-[#718078]">جارٍ تحميل مهام اليوم…</p> : visibleDashboardTasks.length ? <div className="divide-y divide-[#dce1d8]">{visibleDashboardTasks.map(task => { const isOwnTask = task.assigneeProfileId === currentProfile.data?.id; const canOperate = isOwnTask || canManageTaskActions; const canStart = task.status === "new" && canOperate; const canReportObstacle = canOperate && !["completed", "cancelled"].includes(task.status); return <DashboardTaskRow key={task.id} task={task} canOperate={canOperate} canStart={canStart} canReportObstacle={canReportObstacle} isJustCompleted={recentlyCompletedTaskIds.includes(task.id)} actionPending={startTask.isPending || submitForReview.isPending || addProgressNote.isPending || requestReassignment.isPending} onOpen={() => setLocation(`/tasks?taskId=${task.id}`)} onStart={() => startTask.mutate({ taskId: task.id })} onComplete={() => { setTaskActionNote(""); setTaskActionDialog({ kind: "complete", task }); }} onComment={() => { setTaskActionNote(""); setTaskActionDialog({ kind: "comment", task }); }} onReassignment={() => { setTaskActionNote(""); setTaskActionDialog({ kind: "reassignment", task }); }} onObstacle={() => setLocation(`/tasks?taskId=${task.id}&action=obstacle`)} />; })}</div> : <div className="py-10 text-center text-sm text-[#718078]">لا توجد مهام مطابقة للفترة أو الحالة المحددة.</div>}
      </section>}

      {isWidgetVisible("chat") && <aside style={{ order: dashboardPreferences.widgetOrder.indexOf("chat") }} className="xl:sticky xl:top-5 xl:self-start"><section className="rounded-[1.5rem] border border-[#e5e0d5] bg-[#fbfaf6] p-5" aria-label="دردشة القسم"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#2f7656]" aria-hidden="true" /><h2 className="text-lg font-black text-[#25463a]">دردشة القسم</h2></div><span className="rounded-full bg-[#e2f0e4] px-2 py-1 text-[10px] font-bold text-[#2f7656]">{formatUnreadBadgeCount(unreadConversations.data)} جديد</span></div><p className="mt-2 text-xs leading-6 text-[#77847c]">مساحة محادثة مشتركة لفريق القسم، تستخدم المجموعة المصرح بها نفسها في التواصل الداخلي.</p>{teamPreview.length ? <div className="mt-3 divide-y divide-[#ece7dc]">{teamPreview.slice(0, 2).map(member => <button type="button" key={member.id} onClick={() => setLocation(departmentConversation ? `/messages?conversationId=${departmentConversation.id}` : "/messages")} className="flex w-full items-center gap-2.5 py-2.5 text-right hover:opacity-80"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e1eee5] text-[10px] font-black text-[#2f7656]">{profileInitials(member.fullName)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black text-[#365247]">{member.fullName}</span><span className="mt-0.5 block truncate text-[10px] text-[#7b8981]">{member.jobTitle || member.unitName || "عضو في الفريق"}</span></span><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${member.status === "on_leave" ? "bg-[#d1a12f]" : member.status === "pending_review" ? "bg-[#8c78b8]" : "bg-[#2f865a]"}`} title={teamStatusLabel(member.status)} /></button>)}</div> : <p className="mt-4 text-xs leading-6 text-[#77847c]">ستظهر معاينة أعضاء القسم عند توفر ملفات ضمن نطاقك.</p>}<button type="button" onClick={() => setLocation(departmentConversation ? `/messages?conversationId=${departmentConversation.id}` : "/messages")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6f0e7] px-3 py-2.5 text-xs font-black text-[#2f7656]"><MessageCircle className="h-4 w-4" />فتح دردشة القسم</button></section></aside>}
    </div>

    {leadership && isWidgetVisible("performance") && <DepartmentPerformanceChart data={(departmentPerformance.data ?? []) as DepartmentPerformanceRow[]} isLoading={departmentPerformance.isLoading} period={dashboardPeriod} setPeriod={setDashboardPeriod} priority={dashboardPriority} setPriority={setDashboardPriority} jobTitle={dashboardJobTitle} setJobTitle={setDashboardJobTitle} />}
    <Dialog open={Boolean(taskActionDialog)} onOpenChange={open => { if (!open) { setTaskActionDialog(null); setTaskActionNote(""); } }}><DialogContent dir="rtl" className="max-w-lg"><DialogHeader><DialogTitle>{taskActionDialog?.kind === "complete" ? "تأكيد تمت المعالجة" : taskActionDialog?.kind === "comment" ? "إضافة تعليق عادي" : "طلب سحب المهمة"}</DialogTitle><DialogDescription>{taskActionDialog?.kind === "complete" ? "سيتم إرسال المهمة للمدير المباشر للمراجعة والاعتماد." : taskActionDialog?.kind === "comment" ? "يسجل التعليق كتحديث عمل ولا يغير حالة المهمة." : "اكتب سبب طلب سحب المهمة أو إعادة إسنادها. يرسل الطلب للمدير المباشر لاتخاذ القرار."}</DialogDescription></DialogHeader><p className="rounded-lg bg-[#f7f5ef] px-3 py-2 text-xs font-bold text-[#355d4b]">المهمة: {taskActionDialog?.task.title}</p>{taskActionDialog?.kind !== "complete" && <textarea value={taskActionNote} onChange={event => setTaskActionNote(event.target.value)} placeholder={taskActionDialog?.kind === "comment" ? "اكتب تعليقك…" : "سبب طلب سحب المهمة…"} className="min-h-28 w-full rounded-xl border border-[#d8e2d8] bg-white p-3 text-sm outline-none focus:border-[#2f7656]" autoFocus />}<DialogFooter><button type="button" onClick={() => setTaskActionDialog(null)} className="rounded-lg border border-[#d8e2d8] px-4 py-2 text-sm font-bold text-[#31594d]">إلغاء</button><button type="button" disabled={taskActionDialog?.kind !== "complete" && taskActionNote.trim().length < 3} onClick={() => { if (!taskActionDialog) return; if (taskActionDialog.kind === "complete") submitForReview.mutate({ taskId: taskActionDialog.task.id }); if (taskActionDialog.kind === "comment") addProgressNote.mutate({ taskId: taskActionDialog.task.id, note: taskActionNote.trim() }); if (taskActionDialog.kind === "reassignment") requestReassignment.mutate({ taskId: taskActionDialog.task.id, kind: "reassignment", reason: taskActionNote.trim() }); }} className="rounded-lg bg-[#2f7656] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{taskActionDialog?.kind === "complete" ? "تأكيد تمت المعالجة" : taskActionDialog?.kind === "comment" ? "حفظ التعليق" : "إرسال طلب السحب"}</button></DialogFooter></DialogContent></Dialog>
    <DashboardCustomizationDialog open={dashboardCustomizationOpen} onOpenChange={setDashboardCustomizationOpen} preferences={dashboardPreferences} onChange={setDashboardPreferences} onSave={() => saveDashboardPreferences.mutate(dashboardPreferences)} onResetNavigation={() => { const reset = { ...dashboardPreferences, navigationOrder: [...defaultDashboardPreferences().navigationOrder], hiddenNavigationLabels: [] }; setDashboardPreferences(reset); saveDashboardPreferences.mutate(reset); }} isSaving={saveDashboardPreferences.isPending} />
  </section></DashboardLayout>;
}
