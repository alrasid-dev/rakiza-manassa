import { ArrowRight, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function PasswordRecoveryPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const requestPhone = (trpc.court.otp as any).requestByPhone?.useMutation?.() ?? { mutateAsync: async () => { throw new Error("خدمة الاستعادة غير متاحة حالياً."); }, isPending: false };
  const requestEmail = trpc.court.otp.request.useMutation();
  const submitPhone = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await requestPhone.mutateAsync({ phone });
      setNotice(`أُرسل رمز لمرة واحدة إلى قناة التنبيه المرتبطة بجوالك. صالح ${Math.round(result.expiresInSeconds / 60)} دقائق. بعد التحقق سيُطلب منك تسجيل البصمة.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذر الإرسال."); }
  };
  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await requestEmail.mutateAsync({ officialEmail: email.trim() });
      setNotice(`أُرسل الرمز إلى بريد التنبيهات الشخصي المرتبط بالحساب، وليس بالضرورة إلى البريد الرسمي. صالح ${Math.round(result.expiresInSeconds / 60)} دقائق.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذر الإرسال."); }
  };
  return <main dir="rtl" className="min-h-screen bg-[#f7f6ef] px-4 py-10" style={{ fontFamily: "Tajawal, sans-serif" }}><div className="mx-auto max-w-lg rounded-[1.7rem] border bg-white p-6 shadow-sm"><p className="text-xs font-black text-[#b18448]">استعادة مجانية</p><h1 className="mt-2 text-3xl font-black text-[#12352f]">استعادة الدخول</h1><p className="mt-3 text-sm leading-7 text-[#65766d]">لا حاجة لاشتراك مدفوع. أدخل رقم جوالك المسجّل أو بريدك الرسمي ليصل رمز لمرة واحدة إلى بريد التنبيهات الشخصي، ثم سجّل بصمة الجهاز.</p>
    <form onSubmit={submitPhone} className="mt-6 space-y-3"><label className="text-sm font-bold">رقم الجوال<input value={phone} onChange={event => setPhone(event.target.value)} placeholder="05xxxxxxxx" className="mt-2 h-12 w-full rounded-xl border px-3" /></label><button type="submit" disabled={requestPhone.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006c35] py-3 text-sm font-black text-white"><Smartphone className="h-4 w-4" />{requestPhone.isPending ? "جارٍ الإرسال…" : "إرسال رمز للجوال المرتبط"}</button></form>
    <form onSubmit={submitEmail} className="mt-6 space-y-3 border-t pt-5"><label className="text-sm font-bold">البريد الرسمي<input value={email} onChange={event => setEmail(event.target.value)} placeholder="name@moj.gov.sa" className="mt-2 h-12 w-full rounded-xl border px-3" /></label><button type="submit" disabled={requestEmail.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-black">إرسال رمز لبريد التنبيهات <ArrowRight className="h-4 w-4" /></button></form>
    {notice && <p role="status" className="mt-5 rounded-xl bg-[#edf4ee] p-3 text-sm leading-6">{notice}</p>}
    <a href="/login" className="mt-6 block text-center text-sm font-bold text-[#006c35]">العودة لتسجيل الدخول</a>
  </div></main>;
}
