import DashboardLayout from "@/components/DashboardLayout";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { ICON_GUIDE } from "@/lib/icon-guide";
import { trpc } from "@/lib/trpc";
import { BellRing, BookOpen, Moon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function PersonalSettingsPage() {
  const api = (trpc.court as any).workPreferences;
  const mine = api?.mine?.useQuery ? api.mine.useQuery() : { data: { notificationsEnabled: true, dndUntil: null } };
  const update = api?.update?.useMutation ? api.update.useMutation({ onSuccess: () => toast.success("تم حفظ إعداداتك.") }) : { mutate: () => undefined, isPending: false };
  const [hours, setHours] = useState("2");
  return <DashboardLayout hideUtilityPrompts><section dir="rtl" className="mx-auto max-w-4xl"><header className="mb-6"><p className="text-xs font-black text-[#4a785a]">حسابك فقط</p><h1 className="mt-2 text-3xl font-black text-[#12352f]">إعدادات الموظف</h1><p className="mt-2 text-sm text-[#53695e]">تفعيل التنبيهات، عدم الإزعاج، والدليل الإرشادي. لا تغيّر هذه الصفحة صلاحيات الآخرين.</p></header>
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border bg-[#f8f8f3] p-5"><div className="flex items-center gap-3"><BellRing className="h-5 w-5 text-[#2d6b4f]" /><h2 className="font-black">التنبيهات</h2></div><label className="mt-4 flex items-center justify-between text-sm font-bold"><span>استقبال التنبيهات</span><input type="checkbox" checked={mine.data?.notificationsEnabled !== false} onChange={event => update.mutate({ notificationsEnabled: event.target.checked })} className="h-4 w-4 accent-[#2d6b4f]" /></label><div className="mt-4"><PushNotificationPrompt /></div></section>
      <section className="rounded-[1.5rem] border bg-[#f8f8f3] p-5"><div className="flex items-center gap-3"><Moon className="h-5 w-5 text-[#2d6b4f]" /><h2 className="font-black">عدم الإزعاج</h2></div><div className="mt-4 flex flex-wrap gap-2"><select value={hours} onChange={event => setHours(event.target.value)} className="h-10 rounded-xl border px-3 text-sm"><option value="1">ساعة</option><option value="2">ساعتان</option><option value="8">حتى نهاية الدوام</option></select><button type="button" onClick={() => update.mutate({ dndUntil: new Date(Date.now() + Number(hours) * 3600_000) })} className="rounded-xl bg-[#2d6b4f] px-3 py-2 text-xs font-black text-white">تفعيل</button><button type="button" onClick={() => update.mutate({ dndUntil: null })} className="rounded-xl border px-3 py-2 text-xs font-black">إلغاء</button></div></section>
      <section className="rounded-[1.5rem] border bg-white p-5"><div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-[#2d6b4f]" /><h2 className="font-black">الدليل الإرشادي</h2></div><a href="/guide" className="mt-3 inline-block text-sm font-bold text-[#006c35]">فتح دليل الاستخدام الكامل</a><div className="mt-4 grid gap-3 md:grid-cols-2">{ICON_GUIDE.slice(0, 6).map(item => <article key={item.name} className="rounded-xl bg-[#f7faf6] p-3"><p className="text-sm font-black">{item.name}</p><p className="mt-1 text-xs leading-6 text-[#65766d]">{item.actions}</p></article>)}</div></section>
    </div>
  </section></DashboardLayout>;
}
