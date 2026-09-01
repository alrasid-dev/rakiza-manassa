import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CircleDashed, ShieldCheck, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const roleLabels = {
  court_president: "رئيس المحكمة",
  assistant_president: "الرئيس المساعد",
  court_secretary: "أمين المحكمة",
  human_resources_manager: "مدير الموارد البشرية",
  department_manager: "مدير قسم",
  performance_monitor: "مراقبة الأداء",
  trainee_affairs_manager: "مدير شؤون الملازمين",
  technical_support_manager: "مدير الدعم التقني",
  technical_support_agent: "موظف دعم تقني",
  administrative_staff: "موظف إداري",
  judicial_trainee: "ملازم قضائي",
  judge: "قاضٍ",
} as const;

export function LeadershipAccessPage() {
  const utils = trpc.useUtils();
  const assignments = trpc.court.roles.list.useQuery();
  const users = trpc.court.roles.users.useQuery();
  const units = trpc.court.units.list.useQuery();
  const assign = trpc.court.roles.assign.useMutation({ onSuccess: () => { utils.court.roles.list.invalidate(); toast.success("تم حفظ التفويض القيادي."); } });
  const revoke = trpc.court.roles.revoke.useMutation({ onSuccess: () => { utils.court.roles.list.invalidate(); toast.success("تم سحب التفويض وإيقافه."); } });
  const [form, setForm] = useState({ userId: "", role: "assistant_president" as keyof typeof roleLabels, unitId: "" });
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!form.userId) return; assign.mutate({ userId: Number(form.userId), role: form.role, unitId: form.unitId ? Number(form.unitId) : undefined }); };

  return <DashboardLayout><section className="mx-auto max-w-6xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#b18448]">حوكمة الصلاحيات</p><h1 className="mt-2 text-3xl font-bold text-[#12352f]">تفويض القيادة والأقسام</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#65766d]">يمنح مالك المنصة دور الرئيس المساعد أو مدير القسم أو أمين المحكمة ويسحبه. لا يمنح التفويض صلاحية مالك المنصة لإدارة المستخدمين أو تعديل البنية.</p><p className="mt-2 rounded-xl bg-[#f7f4ed] px-4 py-3 text-xs leading-6 text-[#735c32]">لتثبيت مدير قسم فعلياً: اختر الحساب، اختر «مدير قسم»، اربطه بالقسم، ثم افتح «التسلسل الإداري» وأضف المدير بترتيبه. بعدها يظهر في قوائم المراسلات والنسخ وتصل إليه المهام الذاتية.</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ea] text-[#1f5a47]"><UserRoundCog className="h-6 w-6" /></div></div><div className="mt-7 grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]"><form onSubmit={submit} className="rounded-[1.5rem] border border-[#e7e0d4] bg-white p-5 shadow-[0_10px_30px_rgba(30,51,42,0.05)]"><div className="flex items-center gap-2 text-[#12352f]"><ShieldCheck className="h-5 w-5 text-[#b18448]" /><h2 className="font-bold">تفويض جديد</h2></div><div className="mt-5 space-y-3"><label className="block text-xs font-bold text-[#6a786f]">الحساب<select required value={form.userId} onChange={event => setForm({ ...form, userId: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal"><option value="">اختر الحساب</option>{users.data?.map(user => <option key={user.id} value={user.id}>{user.profileName || user.name || user.email || `حساب ${user.id}`}</option>)}</select></label><label className="block text-xs font-bold text-[#6a786f]">الدور<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value as keyof typeof roleLabels })} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal">{Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select></label><label className="block text-xs font-bold text-[#6a786f]">القسم المرتبط (اختياري)<select value={form.unitId} onChange={event => setForm({ ...form, unitId: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal"><option value="">صلاحية قيادية عامة بحسب الدور</option>{units.data?.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label></div><Button disabled={assign.isPending || users.isLoading} className="mt-5 w-full bg-[#006c35] hover:bg-[#00552b]">{assign.isPending ? "جارٍ الحفظ…" : "حفظ التفويض"}</Button>{assign.error && <p className="mt-3 text-xs text-[#a04a35]">{assign.error.message}</p>}</form><div className="rounded-[1.5rem] border border-[#e7e0d4] bg-white p-5 shadow-[0_10px_30px_rgba(30,51,42,0.05)]"><h2 className="text-lg font-bold text-[#12352f]">التفويضات الحالية</h2>{assignments.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-[#6e7e75]"><CircleDashed className="h-4 w-4 animate-spin" /> جارٍ تحميل التفويضات…</div> : assignments.data?.length ? <div className="mt-4 divide-y divide-[#eee8de]">{assignments.data.map(({ assignment, userName, userEmail, unitName }) => <article key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold text-[#29463b]">{userName || userEmail || `الحساب ${assignment.userId}`}</p><p className="mt-1 text-xs text-[#75837c]">{roleLabels[assignment.role]} {unitName ? `· ${unitName}` : "· دون تقييد قسم"}</p></div>{assignment.isActive ? <Button size="sm" variant="outline" disabled={revoke.isPending} onClick={() => revoke.mutate({ assignmentId: assignment.id })} className="border-[#e8c9bd] text-[#a34b34] hover:bg-[#fbe9e4]">سحب الصلاحية</Button> : <span className="rounded-full bg-[#f1f0ec] px-3 py-1 text-xs font-bold text-[#778078]">منتهية</span>}</article>)}</div> : <p className="mt-5 text-sm leading-7 text-[#6d7d74]">لا توجد تفويضات قيادية محفوظة بعد.</p>}</div></div></section></DashboardLayout>;
}
