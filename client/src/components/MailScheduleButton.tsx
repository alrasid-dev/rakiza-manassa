import { trpc } from "@/lib/trpc";
import { CalendarClock, Pause, Play, Repeat2, XCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const weekdayLabels = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function MailScheduleButton({ messageId, status, scheduledAt, onScheduled }: { messageId: number; status: string; scheduledAt?: Date | string | null; onScheduled?: () => void }) {
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [intervalCount, setIntervalCount] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([0]);
  const [monthDay, setMonthDay] = useState(1);
  const [endsAt, setEndsAt] = useState("");
  const recurringSchedules = trpc.court.internalMail.recurringSchedules.useQuery(undefined, { enabled: isOpen && status === "draft" });
  const existingRecurring = useMemo(() => recurringSchedules.data?.find((schedule: any) => schedule.sourceMessageId === messageId), [messageId, recurringSchedules.data]);
  const schedule = trpc.court.internalMail.schedule.useMutation({
    onSuccess: async () => { await Promise.all([utils.court.internalMail.list.invalidate(), utils.court.internalMail.folderCounts.invalidate(), utils.court.internalMail.get.invalidate({ messageId })]); toast.success("تمت جدولة رسالة بريد ركيزة."); setIsOpen(false); onScheduled?.(); },
    onError: error => toast.error(error.message),
  });
  const scheduleRecurring = trpc.court.internalMail.scheduleRecurring.useMutation({
    onSuccess: async () => { await Promise.all([recurringSchedules.refetch(), utils.court.internalMail.list.invalidate(), utils.court.internalMail.folderCounts.invalidate(), utils.court.internalMail.get.invalidate({ messageId })]); toast.success("تم حفظ الجدولة المتكررة لبريد ركيزة. تبقى المسودة المصدر قابلة للتعديل والإدارة."); setIsOpen(false); },
    onError: error => toast.error(error.message),
  });
  const updateRecurring = trpc.court.internalMail.updateRecurringSchedule.useMutation({
    onSuccess: async () => { await recurringSchedules.refetch(); toast.success("تم تحديث الجدولة المتكررة."); },
    onError: error => toast.error(error.message),
  });
  if (status !== "draft") return scheduledAt ? <span className="text-[10px] font-bold text-[#8c6f1b]">مجدولة: {new Date(scheduledAt).toLocaleString("ar-SA")}</span> : null;

  const submit = () => {
    const startsAt = new Date(value);
    if (!value || Number.isNaN(startsAt.getTime())) { toast.error("اختر موعد إرسال صحيحاً."); return; }
    if (!recurring) { schedule.mutate({ messageId, scheduledAt: startsAt }); return; }
    const end = endsAt ? new Date(endsAt) : null;
    if (endsAt && (!end || Number.isNaN(end.getTime()))) { toast.error("اختر تاريخ انتهاء صحيحاً أو اتركه فارغاً."); return; }
    if (frequency === "weekly" && !weekdays.length) { toast.error("اختر يوماً واحداً على الأقل للتكرار الأسبوعي."); return; }
    scheduleRecurring.mutate({ messageId, frequency, intervalCount: Math.max(1, Math.min(365, Math.floor(Number(intervalCount) || 1))), weekdays: frequency === "weekly" ? weekdays : undefined, monthDay: frequency === "monthly" ? Math.max(1, Math.min(31, Math.floor(Number(monthDay) || 1))) : null, startsAt, endsAt: end });
  };
  const toggleDay = (day: number) => setWeekdays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day].sort((a, b) => a - b));
  const pending = schedule.isPending || scheduleRecurring.isPending || updateRecurring.isPending;
  const scheduleStatus = existingRecurring?.status === "active" ? "مفعلة" : existingRecurring?.status === "paused" ? "متوقفة" : "ملغاة";

  return <span className="relative"><button type="button" title="جدولة الإرسال" aria-label="فتح جدولة الإرسال" onClick={() => setIsOpen(current => !current)} className="grid h-9 w-9 place-items-center rounded-lg text-[#426457] hover:bg-[#edf6ef]"><CalendarClock className="h-4 w-4" /></button>{isOpen ? <span className="absolute left-0 top-10 z-20 block w-[19rem] rounded-xl border border-[#dce6dc] bg-white p-3 text-right shadow-lg"><label className="block text-[11px] font-black text-[#365848]">وقت بداية الإرسال<input aria-label="وقت الإرسال المجدول" type="datetime-local" value={value} onChange={event => setValue(event.target.value)} className="mt-2 w-full rounded-lg border border-[#d9e5da] px-2 py-2 text-xs" /></label>{existingRecurring ? <div className="mt-3 rounded-lg border border-[#dbe8dc] bg-[#f6faf6] p-2.5"><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-black text-[#315f49]">تكرار قائم: {scheduleStatus}</p><Repeat2 className="h-4 w-4 text-[#247348]" /></div><p className="mt-1 text-[10px] leading-5 text-[#5b7264]">{existingRecurring.frequency === "daily" ? "يومي" : existingRecurring.frequency === "weekly" ? "أسبوعي" : "شهري"} كل {existingRecurring.intervalCount} · الموعد القادم {new Date(existingRecurring.nextRunAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</p>{existingRecurring.status !== "cancelled" ? <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" disabled={pending} onClick={() => updateRecurring.mutate({ scheduleId: existingRecurring.id, action: existingRecurring.status === "active" ? "pause" : "resume" })} className="inline-flex items-center gap-1 rounded-md border border-[#cfe0d1] px-2 py-1.5 text-[10px] font-black text-[#315f49]">{existingRecurring.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{existingRecurring.status === "active" ? "إيقاف" : "استئناف"}</button><button type="button" disabled={pending} onClick={() => updateRecurring.mutate({ scheduleId: existingRecurring.id, action: "cancel" })} className="inline-flex items-center gap-1 rounded-md border border-[#ead1c9] px-2 py-1.5 text-[10px] font-black text-[#9a4938]"><XCircle className="h-3 w-3" />إلغاء</button></div> : null}</div> : null}<label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg bg-[#f3f8f3] px-2.5 py-2 text-xs font-bold text-[#315f49]"><input type="checkbox" checked={recurring} onChange={event => setRecurring(event.target.checked)} /><Repeat2 className="h-3.5 w-3.5" />تكرار هذه الرسالة</label>{recurring ? <div className="mt-3 space-y-3 border-t border-[#e0ebe1] pt-3"><div className="grid grid-cols-2 gap-2"><label className="text-[10px] font-bold text-[#526b5d]">النمط<select aria-label="نمط التكرار" value={frequency} onChange={event => setFrequency(event.target.value as typeof frequency)} className="mt-1 w-full rounded-lg border border-[#d9e5da] bg-white px-2 py-2 text-xs"><option value="daily">يومي</option><option value="weekly">أسبوعي</option><option value="monthly">شهري</option></select></label><label className="text-[10px] font-bold text-[#526b5d]">كل عدد<input aria-label="فاصل التكرار" type="number" min="1" max="365" value={intervalCount} onChange={event => setIntervalCount(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#d9e5da] px-2 py-2 text-xs" /></label></div>{frequency === "weekly" ? <fieldset><legend className="text-[10px] font-bold text-[#526b5d]">أيام الأسبوع</legend><div className="mt-1 flex flex-wrap gap-1">{weekdayLabels.map((label, day) => <button type="button" key={label} aria-pressed={weekdays.includes(day)} onClick={() => toggleDay(day)} className={`rounded-md px-2 py-1 text-[10px] font-bold ${weekdays.includes(day) ? "bg-[#17623d] text-white" : "border border-[#d9e5da] text-[#587164]"}`}>{label.slice(0, 4)}</button>)}</div></fieldset> : null}{frequency === "monthly" ? <label className="block text-[10px] font-bold text-[#526b5d]">يوم الشهر<input aria-label="يوم الشهر" type="number" min="1" max="31" value={monthDay} onChange={event => setMonthDay(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#d9e5da] px-2 py-2 text-xs" /></label> : null}<label className="block text-[10px] font-bold text-[#526b5d]">تاريخ الانتهاء (اختياري)<input aria-label="تاريخ انتهاء التكرار" type="datetime-local" value={endsAt} onChange={event => setEndsAt(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d9e5da] px-2 py-2 text-xs" /></label></div> : null}<button type="button" onClick={submit} disabled={pending} className="mt-3 w-full rounded-lg bg-[#0e6a40] px-3 py-2 text-xs font-black text-white disabled:opacity-50">{pending ? "جارٍ الحفظ…" : recurring ? "تأكيد التكرار" : "تأكيد الجدولة"}</button></span> : null}</span>;
}
