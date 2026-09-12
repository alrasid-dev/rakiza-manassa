import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, CircleDashed } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";

/** سجل تكليف تشغيلي عام (موظف/قاضٍ/ملازم) عبر people.createDelegation. */
export default function ProfileAssignmentPanel({ autoFocus = false }: { autoFocus?: boolean }) {
  const utils = trpc.useUtils();
  const people = trpc.court.people.list.useQuery();
  const delegations = trpc.court.people.delegations.useQuery();
  const create = trpc.court.people.createDelegation.useMutation({
    onSuccess: async () => {
      await utils.court.people.delegations.invalidate();
      setForm({ delegateProfileId: "", coveredProfileId: "", assignmentType: "acting", title: "", startsAt: "", endsAt: "", notes: "" });
      toast.success("تم حفظ التكليف في سجل مستقل دون تغيير الملف الأساسي.");
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });
  const update = trpc.court.people.updateDelegationStatus.useMutation({ onSuccess: () => utils.court.people.delegations.invalidate() });
  const [form, setForm] = useState({ delegateProfileId: "", coveredProfileId: "", assignmentType: "acting" as "acting" | "temporary_duty" | "formation_assignment", title: "", startsAt: "", endsAt: "", notes: "" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const delegate = people.data?.find(person => person.id === Number(form.delegateProfileId));
    if (!delegate || !form.startsAt || !form.title) return;
    create.mutate({
      delegateProfileId: delegate.id,
      coveredProfileId: form.coveredProfileId ? Number(form.coveredProfileId) : undefined,
      unitId: delegate.unitId ?? undefined,
      assignmentType: form.assignmentType,
      title: form.title,
      startsAt: new Date(form.startsAt),
      endsAt: form.endsAt ? new Date(form.endsAt) : undefined,
      notes: form.notes || undefined,
    });
  };
  return (
    <section id="hr-assignment" className={`mt-5 rounded-[1.5rem] border border-[#d8e6dc] bg-[#f7fbf7] p-5 shadow-[0_10px_30px_rgba(30,51,42,0.04)] ${autoFocus ? "ring-2 ring-[#7faa82]" : ""}`}>
      <div className="flex items-center gap-2 text-[#12352f]"><ClipboardCheck className="h-5 w-5 text-[#b18448]" /><h2 className="font-bold">تكليف تشغيلي</h2></div>
      <p className="mt-2 text-xs leading-6 text-[#6e7e75]">يُسجل التكليف منفصلاً عن الملف الأساسي للموظف أو القاضي أو الملازم.</p>
      <div className="mt-5 grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <form onSubmit={submit} className="space-y-3">
          <select required value={form.delegateProfileId} onChange={e => setForm({ ...form, delegateProfileId: e.target.value })} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="">اختر المكلف</option>{people.data?.map(person => <option key={person.id} value={person.id}>{person.fullName} · {person.personType === "judge" ? "قاضٍ" : person.personType === "trainee" ? "ملازم" : "موظف"}</option>)}</select>
          <select value={form.coveredProfileId} onChange={e => setForm({ ...form, coveredProfileId: e.target.value })} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="">المكلف عنه (اختياري)</option>{people.data?.map(person => <option key={person.id} value={person.id}>{person.fullName} · {person.personType === "judge" ? "قاضٍ" : person.personType === "trainee" ? "ملازم" : "موظف"}</option>)}</select>
          <select value={form.assignmentType} onChange={e => setForm({ ...form, assignmentType: e.target.value as typeof form.assignmentType })} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="acting">تكليف بالعمل</option><option value="temporary_duty">مهمة مؤقتة</option><option value="formation_assignment">تكليف بتشكيل</option></select>
          <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="مسمى التكليف أو الجهة" />
          <label className="block text-xs font-bold text-[#6a786f]">بداية التكليف<Input required type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className="mt-1" /></label>
          <label className="block text-xs font-bold text-[#6a786f]">نهاية التكليف (اختياري)<Input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} className="mt-1" /></label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="min-h-20 w-full rounded-md border border-input bg-white p-3 text-sm" placeholder="ملاحظات أو مرجع القرار" />
          <Button disabled={create.isPending || people.isLoading} className="w-full bg-[#12352f] hover:bg-[#1d5245]">{create.isPending ? "جارٍ حفظ التكليف…" : "حفظ التكليف"}</Button>
          {create.error && <p role="alert" className="rounded-xl bg-[#fbe9e4] p-3 text-xs text-[#9a4634]">{create.error.message}</p>}
        </form>
        <div className="rounded-2xl border border-[#e7e0d4] bg-white p-4">
          <h3 className="font-bold text-[#29463b]">سجل التكليفات</h3>
          {delegations.isLoading ? <p className="mt-4 flex items-center gap-2 text-sm text-[#6e7e75]"><CircleDashed className="h-4 w-4 animate-spin" /> جارٍ التحميل…</p> : delegations.data?.length ? (
            <div className="mt-3 divide-y divide-[#eee8de]">{delegations.data.slice(0, 10).map(item => (
              <div key={item.delegation.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#29463b]">{item.delegation.title}</p>
                    <p className="mt-1 text-xs text-[#75837c]">المكلف: {item.delegateName}{item.coveredName ? ` · المكلف عنه: ${item.coveredName}` : ""}</p>
                    <p className="mt-1 text-xs text-[#75837c]">من {new Date(item.delegation.startsAt).toLocaleString("ar-SA")}{item.delegation.endsAt ? ` إلى ${new Date(item.delegation.endsAt).toLocaleString("ar-SA")}` : ""}</p>
                  </div>
                  <select aria-label={`حالة تكليف ${item.delegation.title}`} value={item.delegation.status} onChange={event => update.mutate({ delegationId: item.delegation.id, status: event.target.value as "planned" | "active" | "ended" | "cancelled" })} className="h-9 rounded-md border border-input bg-white px-2 text-xs">
                    <option value="planned">مخطط</option><option value="active">نشط</option><option value="ended">منتهٍ</option><option value="cancelled">ملغى</option>
                  </select>
                </div>
              </div>
            ))}</div>
          ) : <p className="mt-4 text-sm text-[#75837c]">لا توجد تكليفات مسجلة بعد.</p>}
        </div>
      </div>
    </section>
  );
}
