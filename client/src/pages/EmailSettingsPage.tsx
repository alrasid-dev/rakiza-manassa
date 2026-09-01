import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import React, { useEffect, useState } from "react";
import { MailCheck, ShieldCheck, Volume2, VolumeX } from "lucide-react";

export function EmailSettingsPage() {
  const settings = trpc.court.emailSettings.mine.useQuery();
  const update = trpc.court.emailSettings.update.useMutation({ onSuccess: () => settings.refetch() });
  const [notificationEmail, setNotificationEmail] = useState("");
  const [recommendationSoundEnabled, setRecommendationSoundEnabled] = useState(true);

  useEffect(() => {
    if (settings.data) setNotificationEmail(settings.data.notificationEmail ?? "");
    setRecommendationSoundEnabled(window.localStorage.getItem("rakiza:recommendation-sound") !== "off");
  }, [settings.data]);

  const toggleRecommendationSound = () => {
    const next = !recommendationSoundEnabled;
    setRecommendationSoundEnabled(next);
    window.localStorage.setItem("rakiza:recommendation-sound", next ? "on" : "off");
  };

  return <DashboardLayout><section dir="rtl" className="mx-auto max-w-3xl">
    <div className="rounded-[1.7rem] bg-[#12352f] p-7 text-white shadow-[0_20px_45px_rgba(18,53,47,.18)]">
      <p className="text-xs font-bold tracking-[.14em] text-[#f0cc76]">هوية الحساب وقناة التنبيه</p>
      <h1 className="mt-3 text-3xl font-bold">البريد الرسمي وبريد الإشعارات</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8e2d8]">البريد الرسمي هو رقمك التعريفي الثابت داخل رَكيزة، أما البريد الإضافي فهو القناة التي تستقبل رمز OTP وتنبيهات المهام والحضور.</p>
    </div>
    <div className="mt-6 rounded-[1.7rem] border border-[#e7e0d4] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><MailCheck className="h-6 w-6 text-[#006c35]" /><div><h2 className="font-bold text-[#12352f]">المعرّف الرسمي</h2><p className="text-sm text-[#718078]">لا يمكن تغييره من هذه الشاشة ولا يستخدم كمعرّف بديل.</p></div></div>
      <div className="mt-4 rounded-xl bg-[#f3f6f1] px-4 py-3 font-semibold text-[#29463b]">{settings.data?.officialEmail ?? "غير مثبت بعد"}</div>
      {settings.data && !settings.data.officialEmailIsValid && <p className="mt-3 text-sm text-[#9a4634]">يلزم تثبيت بريد رسمي من نطاق moj.gov.sa.</p>}
      <div className="mt-7 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#b18448]" /><h2 className="font-bold text-[#12352f]">بريد الإشعارات</h2></div>
      <label className="mt-4 block text-sm font-bold text-[#385449]">البريد الذي يستقبل OTP والتنبيهات<input type="email" value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)} placeholder="alerts@example.com" className="mt-2 h-11 w-full rounded-xl border border-input px-3 text-sm" /></label>
      <p className="mt-2 text-xs leading-5 text-[#78867e]">بعد تغييره، اطلب رمز دخول جديداً لتأكيد ملكيتك للبريد. لا يظهر هذا البريد في البحث أو المراسلات الداخلية.</p>
      <p className={`mt-3 rounded-xl p-3 text-sm ${settings.data?.notificationEmailVerifiedAt ? "bg-[#e9f2ea] text-[#2f694f]" : "bg-[#fff8e8] text-[#8a6731]"}`}>{settings.data?.notificationEmailVerifiedAt ? "بريد الإشعارات موثق ويستقبل التنبيهات." : "بريد الإشعارات غير موثق بعد؛ سيُوثق عند نجاح أول OTP."}</p>
      <Button className="mt-6 bg-[#006c35] hover:bg-[#00552b]" disabled={update.isPending || !settings.data?.officialEmailIsValid} onClick={() => update.mutate({ notificationEmail: notificationEmail.trim() || null })}>{update.isPending ? "جارٍ الحفظ…" : "حفظ بريد الإشعارات"}</Button>
      {update.error && <p role="alert" className="mt-3 text-sm text-[#9a4634]">{update.error.message}</p>}
      {update.isSuccess && <p className="mt-3 text-sm font-bold text-[#2f7351]">تم حفظ بريد الإشعارات. استخدم OTP القادم لتوثيقه.</p>}
      <div className="mt-8 border-t border-[#eee8de] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${recommendationSoundEnabled ? "bg-[#e9f2ea] text-[#2f7351]" : "bg-[#fbece7] text-[#a04a35]"}`}>{recommendationSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</span><div><h2 className="font-bold text-[#12352f]">نغمة توصيات الإنجاز</h2><p className="mt-1 text-xs leading-5 text-[#718078]">يتحكم هذا الخيار في النغمة القصيرة فقط، بينما تبقى رسالة Toast المرئية مفعلة.</p></div></div>
          <button type="button" role="switch" aria-checked={recommendationSoundEnabled} onClick={toggleRecommendationSound} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${recommendationSoundEnabled ? "bg-[#006c35] text-white" : "border border-[#d9d0c3] bg-white text-[#7c4d3f]"}`}>{recommendationSoundEnabled ? "النغمة مفعلة" : "النغمة مكتومة"}</button>
        </div>
      </div>
    </div>
  </section></DashboardLayout>;
}
