import React, { useEffect, useState } from "react";
import { Bell, Fingerprint, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { platformHref } from "@/lib/pwa";

type Mode = "daily" | "register" | "recover" | "settings";
type Employee = { id: string; fullName: string; email: string; hasBiometric: boolean; notificationsEnabled: boolean };

async function api(path: string, options?: RequestInit) {
  const response = await fetch(`/api/employee-auth${path}`, { credentials: "include", headers: { "content-type": "application/json", ...(options?.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "تعذر تنفيذ الطلب.");
  return body;
}

export default function EmployeeStaffAuthPage() {
  const [mode, setMode] = useState<Mode>("daily");
  const [notice, setNotice] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [directory, setDirectory] = useState<Array<{ fullName: string; department: string }>>([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", pin: "", biometricId: "rakiza-device-1" });

  useEffect(() => {
    void api("/directory").then(data => setDirectory(data.approvedEmployees ?? [])).catch(() => undefined);
    void api("/me").then(data => setEmployee(data.employee)).catch(() => undefined);
  }, []);

  const onChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm(current => ({ ...current, [key]: event.target.value }));

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    try {
      const result = await api("/register", { method: "POST", body: JSON.stringify(form) });
      setChallengeId(result.oneTimeVerification.challengeId);
      setOtp(result.oneTimeVerification.code);
      setNotice(`${result.message} الرمز الظاهر مرة واحدة: ${result.oneTimeVerification.code}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر التسجيل.");
    }
  };

  const verifyOnce = async () => {
    const result = await api("/verify-once", { method: "POST", body: JSON.stringify({ challengeId, code: otp }) });
    setNotice(result.verified ? "تم التحقق المجاني لمرة واحدة. استخدم PIN أو البصمة في الدخول اليومي." : "تعذر التحقق.");
    const me = await api("/me");
    setEmployee(me.employee);
    setMode("daily");
  };

  const dailyPin = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    try {
      const result = await api("/login/pin", { method: "POST", body: JSON.stringify({ pin: form.pin }) });
      setEmployee(result.employee);
      setNotice("تم الدخول اليومي برمز PIN دون بريد أو OTP.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر الدخول.");
    }
  };

  const dailyBiometric = async () => {
    setNotice("");
    try {
      const result = await api("/login/biometric", { method: "POST", body: JSON.stringify({ credentialId: form.biometricId }) });
      setEmployee(result.employee);
      setNotice("تم الدخول اليومي بالبصمة دون إشعار تحقق.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر الدخول بالبصمة.");
    }
  };

  const saveBiometric = async () => {
    await api("/devices/biometric", { method: "POST", body: JSON.stringify({ credentialId: form.biometricId }) });
    setNotice("سُجّلت بصمة هذا الجهاز. الدخول اليومي القادم بالبصمة فقط.");
  };

  const recover = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await api("/recover/start", { method: "POST", body: JSON.stringify({ email: form.email }) });
    setChallengeId(result.challengeId);
    setOtp(result.code);
    setNotice(`${result.message} الرمز: ${result.code}`);
  };

  const completeRecover = async () => {
    await api("/recover/complete", { method: "POST", body: JSON.stringify({ challengeId, code: otp, password: form.password, pin: form.pin }) });
    setNotice("تم تعيين PIN وكلمة مرور جديدين. الدخول اليومي بالـ PIN أو البصمة فقط.");
    setMode("daily");
  };

  const toggleNotifications = async (enabled: boolean) => {
    const result = await api("/settings/notifications", { method: "POST", body: JSON.stringify({ enabled }) });
    setEmployee(current => current ? { ...current, notificationsEnabled: result.notificationsEnabled } : current);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f6ef] px-4 py-8 text-[#243a32]" style={{ fontFamily: "Tajawal, sans-serif" }}>
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[.14em] text-[#b18448]">رَكيزة · موظفين معتمدين</p>
            <h1 className="mt-2 text-3xl font-black text-[#12352f]">دخول الموظفين</h1>
            <p className="mt-2 text-sm leading-7 text-[#6c7b73]">التسجيل مرة واحدة بعد مطابقة الاسم. الدخول اليومي: PIN أو بصمة فقط. لا بريد ولا OTP في الدخول اليومي.</p>
          </div>
          <ShieldCheck className="h-10 w-10 text-[#006c35]" />
        </header>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#eef3ec] p-1 sm:grid-cols-4">
          {([["daily", "دخول يومي"], ["register", "تسجيل أول مرة"], ["recover", "استعادة"], ["settings", "إعدادات"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => { setMode(id); setNotice(""); }} className={`rounded-xl px-3 py-3 text-sm font-black ${mode === id ? "bg-white text-[#006c35]" : "text-[#6d7c74]"}`}>{label}</button>
          ))}
        </div>

        {mode === "register" && (
          <form onSubmit={register} className="mt-6 space-y-4 rounded-[1.5rem] border bg-white p-6">
            <div className="flex items-center gap-2 font-black text-[#12352f]"><UserPlus className="h-5 w-5" />نموذج التسجيل الأول</div>
            <p className="text-xs leading-6 text-[#718078]">الأسماء المعتمدة: {directory.map(item => item.fullName).join(" · ") || "جارٍ التحميل…"}</p>
            <input required value={form.fullName} onChange={onChange("fullName")} placeholder="الاسم الكامل كما في السجل" className="h-12 w-full rounded-xl border px-3" />
            <input required type="email" value={form.email} onChange={onChange("email")} placeholder="البريد الإلكتروني" className="h-12 w-full rounded-xl border px-3" />
            <input required type="password" value={form.password} onChange={onChange("password")} placeholder="كلمة المرور" className="h-12 w-full rounded-xl border px-3" />
            <input required value={form.pin} onChange={event => setForm(current => ({ ...current, pin: event.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="PIN من 6 أرقام" inputMode="numeric" className="h-12 w-full rounded-xl border px-3 tracking-[.4em]" />
            <Button type="submit" className="w-full bg-[#006c35] py-6 hover:bg-[#00552b]">إنشاء الحساب وإظهار رمز التحقق المجاني</Button>
            {challengeId && <Button type="button" variant="outline" className="w-full" onClick={() => void verifyOnce()}>تأكيد الرمز المجاني لمرة واحدة</Button>}
          </form>
        )}

        {mode === "daily" && (
          <section className="mt-6 space-y-4 rounded-[1.5rem] border bg-white p-6">
            <p className="text-sm font-black text-[#12352f]">الدخول اليومي — خياران فقط</p>
            <form onSubmit={dailyPin} className="space-y-3">
              <label className="block text-sm font-bold">رمز PIN<input value={form.pin} onChange={event => setForm(current => ({ ...current, pin: event.target.value.replace(/\D/g, "").slice(0, 6) }))} inputMode="numeric" className="mt-2 h-14 w-full rounded-xl border text-center text-2xl tracking-[.45em]" placeholder="••••••" /></label>
              <Button type="submit" className="w-full bg-[#006c35] py-6 hover:bg-[#00552b]"><KeyRound className="ml-2 h-4 w-4" />دخول بالـ PIN</Button>
            </form>
            <Button type="button" variant="outline" className="w-full py-6" onClick={() => void dailyBiometric()}><Fingerprint className="ml-2 h-4 w-4" />دخول بالبصمة</Button>
          </section>
        )}

        {mode === "recover" && (
          <form onSubmit={recover} className="mt-6 space-y-4 rounded-[1.5rem] border bg-white p-6">
            <p className="text-sm leading-7 text-[#5b6c63]">الاستعادة وحدها تُظهر OTP مجانياً لمرة واحدة. الدخول اليومي لا يطلب هذا الرمز.</p>
            <input required type="email" value={form.email} onChange={onChange("email")} placeholder="البريد" className="h-12 w-full rounded-xl border px-3" />
            <Button type="submit" className="w-full bg-[#006c35] py-6 hover:bg-[#00552b]">إظهار رمز الاستعادة المجاني</Button>
            {challengeId && <>
              <input value={otp} onChange={event => setOtp(event.target.value)} className="h-12 w-full rounded-xl border px-3" />
              <input type="password" value={form.password} onChange={onChange("password")} placeholder="كلمة مرور جديدة" className="h-12 w-full rounded-xl border px-3" />
              <input value={form.pin} onChange={event => setForm(current => ({ ...current, pin: event.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="PIN جديد" className="h-12 w-full rounded-xl border px-3" />
              <Button type="button" variant="outline" className="w-full" onClick={() => void completeRecover()}>حفظ البيانات الجديدة</Button>
            </>}
          </form>
        )}

        {mode === "settings" && (
          <section className="mt-6 space-y-4 rounded-[1.5rem] border bg-white p-6">
            <div className="flex items-center gap-2 font-black"><Bell className="h-5 w-5" />إعدادات الإشعارات — منفصلة عن الدخول</div>
            {employee ? <>
              <p className="text-sm">{employee.fullName} · {employee.email}</p>
              <label className="flex items-center justify-between text-sm font-bold">تفعيل الإشعارات<input type="checkbox" checked={employee.notificationsEnabled} onChange={event => void toggleNotifications(event.target.checked)} className="h-4 w-4 accent-[#006c35]" /></label>
              <Button type="button" variant="outline" className="w-full" onClick={() => void saveBiometric()}>تسجيل بصمة هذا الجهاز</Button>
              <Button type="button" className="w-full bg-[#12352f]" onClick={async () => { await api("/logout", { method: "POST" }); setEmployee(null); }}>تسجيل الخروج</Button>
            </> : <p className="text-sm text-[#718078]">ادخل أولاً بالـ PIN أو البصمة لتظهر إعدادات الإشعارات.</p>}
          </section>
        )}

        {notice && <p role="status" className="mt-5 rounded-xl bg-[#edf4ee] p-4 text-sm leading-7 text-[#355445]">{notice}</p>}
        <a href={platformHref("login")} className="mt-6 block text-center text-sm font-bold text-[#006c35]">العودة لصفحة الدخول العامة</a>
      </div>
    </main>
  );
}
