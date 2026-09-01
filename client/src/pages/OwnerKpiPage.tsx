import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Activity, Scale } from "lucide-react";
import React from "react";

export default function OwnerKpiPage() {
  const kpis = (trpc.court as any).ownerKpis?.useQuery ? (trpc.court as any).ownerKpis.useQuery() : { data: null, isLoading: false, error: null };
  const data = kpis.data;
  return <DashboardLayout><section dir="rtl" className="mx-auto max-w-6xl"><header className="mb-6"><p className="text-xs font-black tracking-[0.14em] text-[#b18448]">المالك ورئيس المحكمة فقط</p><h1 className="mt-2 text-3xl font-black text-[#12352f]">مؤشرات القيادة</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[#65766d]">نسبة إنجاز الأقسام، الضغط، عدد المساءلات، متوسط وقت الإنجاز، واقتراحات المداورة. هذه مؤشرات إرشادية وليست أداة عقوبة.</p></header>
    {kpis.isLoading ? <p>جارٍ احتساب المؤشرات…</p> : kpis.error ? <p className="text-[#a04a35]">{kpis.error.message}</p> : data ? <div className="grid gap-4 md:grid-cols-4"><article className="rounded-2xl bg-[#e9f3ea] p-5"><p className="text-xs">متوسط إنجاز الأقسام</p><p className="mt-2 text-3xl font-black">{data.departmentCompletionRate}%</p></article><article className="rounded-2xl bg-[#fff4ec] p-5"><p className="text-xs">أقسام بضغط مرتفع</p><p className="mt-2 text-3xl font-black">{data.highPressureDepartments.length}</p></article><article className="rounded-2xl bg-[#fbeae5] p-5"><p className="text-xs">عدد المساءلات المفتوحة</p><p className="mt-2 text-3xl font-black">{data.accountabilityCount}</p></article><article className="rounded-2xl bg-[#f4f2e8] p-5"><p className="text-xs">متوسط وقت الإنجاز بالساعات</p><p className="mt-2 text-3xl font-black">{data.averageCompletionHours ?? "—"}</p></article>
      <section className="rounded-[1.5rem] border bg-white p-5 md:col-span-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#006c35]" /><h2 className="font-bold">اقتراحات المداورة</h2></div>{data.rotationSuggestions?.length ? data.rotationSuggestions.map((item: any) => <p key={item.from} className="mt-3 text-sm leading-7">من <b>{item.from}</b> إلى <b>{item.to}</b> — {item.reason}</p>) : <p className="mt-3 text-sm text-[#718078]">لا توجد اقتراحات مداورة حالياً.</p>}<a href="/rotation" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#006c35]"><Scale className="h-4 w-4" />فتح نظام المداورة</a></section></div> : null}
  </section></DashboardLayout>;
}
