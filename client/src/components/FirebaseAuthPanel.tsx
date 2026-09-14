import React, { useEffect, useState } from "react";
import { Chrome, KeyRound, MailCheck } from "lucide-react";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getRedirectResult, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updatePassword } from "firebase/auth";
import { platformBasePath } from "@/lib/pwa";
import { trpc } from "@/lib/trpc";
import { firebaseWebConfigReady, getFirebaseAuth } from "@/lib/firebase";
import { PASSWORD_POLICY_HINT, validateLoginPassword, validateNewPassword } from "@shared/password-policy";
import { Button } from "./ui/button";

type Props = {
  officialEmail: string;
  validOfficialEmail: boolean;
  activationToken?: string | null;
  forcePasswordSetup?: boolean;
  onPasswordSetupComplete?: () => void;
};

export function FirebaseAuthPanel({ officialEmail, validOfficialEmail, activationToken, forcePasswordSetup = false, onPasswordSetupComplete }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"google" | "signin" | "register" | "change" | null>(null);
  const exchange = (trpc.court as any).firebaseAuth.exchange.useMutation();
  const completePasswordSetup = (trpc.court as any).firebaseAuth.completePasswordSetup?.useMutation?.() ?? { mutateAsync: async () => ({ success: true }), isPending: false };
  const activationMode = Boolean(activationToken) || forcePasswordSetup;

  const firebaseErrorMessage = (error: unknown, fallback: string) => {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
    if (code === "auth/internal-error") return "تعذر إكمال الاتصال بخدمة Firebase. تأكد من تفعيل Email/Password في Firebase Authentication، ثم أعد المحاولة.";
    if (code === "auth/network-request-failed") return "تعذر الاتصال بخدمة Firebase من هذا الجهاز. تحقق من الإنترنت أو جرّب شبكة جوال/نافذة خفية، ثم أعد المحاولة.";
    if (code === "auth/operation-not-allowed") return "طريقة الدخول هذه غير مفعلة في Firebase Authentication حتى الآن.";
    if (code === "auth/invalid-credential" || code === "auth/invalid-login-credentials") return "البريد أو كلمة المرور غير صحيحة، أو لم يتم إنشاء كلمة مرور لهذا البريد بعد.";
    if (code === "auth/email-already-in-use") return "يوجد حساب بكلمة مرور لهذا البريد. استخدم «دخول بالبريد» أو عيّن كلمة مرور جديدة عبر OTP ثم التفعيل.";
    if (code === "auth/popup-blocked") return "المتصفح منع النافذة المنبثقة؛ أعد المحاولة وسيُفتح تسجيل Google في الصفحة نفسها.";
    return error instanceof Error ? error.message : fallback;
  };

  const bridgeSession = async (user: { getIdToken: () => Promise<string> }, options?: { completePasswordSetup?: boolean }) => {
    const idToken = await user.getIdToken();
    const result = await exchange.mutateAsync({ idToken, ...(activationToken ? { activationToken } : {}), ...(options?.completePasswordSetup ? { completePasswordSetup: true } : {}) });
    if (result?.mustChangePassword) {
      setNotice("يلزم تعيين كلمة مرور جديدة قبل متابعة الدخول إلى رَكيزة.");
      onPasswordSetupComplete?.();
      return;
    }
    onPasswordSetupComplete?.();
    window.location.assign(platformBasePath());
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    void getRedirectResult(auth).then(result => {
      if (result) void bridgeSession(result.user);
    }).catch(error => setNotice(firebaseErrorMessage(error, "تعذر إكمال دخول Google.")));
  }, []);

  const signInGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) { setNotice("إعداد Firebase غير مكتمل حالياً."); return; }
    setBusy("google"); setNotice("");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await bridgeSession(result.user);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (["auth/internal-error", "auth/popup-blocked", "auth/popup-closed-by-user"].includes(code)) {
        setNotice("سيتم فتح Google في الصفحة نفسها لإكمال الدخول بأمان.");
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      }
      setNotice(firebaseErrorMessage(error, "تعذر الدخول عبر Google."));
    } finally { setBusy(null); }
  };

  const signInEmail = async () => {
    const auth = getFirebaseAuth();
    if (!auth || !validOfficialEmail) { setNotice("أدخل البريد الرسمي أولاً."); return; }
    const loginPolicy = validateLoginPassword(password);
    if (!loginPolicy.ok) { setNotice(loginPolicy.message); return; }
    setBusy("signin"); setNotice("");
    try {
      const result = await signInWithEmailAndPassword(auth, officialEmail.trim().toLowerCase(), password);
      if (!result.user.emailVerified && !activationMode) { await signOut(auth); setNotice("أكد بريدك الرسمي من الرسالة المرسلة إليه قبل الدخول."); return; }
      await bridgeSession(result.user);
    } catch (error) { setNotice(firebaseErrorMessage(error, "تعذر الدخول بالبريد وكلمة المرور.")); }
    finally { setBusy(null); }
  };

  const registerEmail = async () => {
    const auth = getFirebaseAuth();
    if (!auth || !validOfficialEmail) { setNotice("أدخل البريد الرسمي أولاً."); return; }
    const newPasswordPolicy = validateNewPassword(password);
    if (!newPasswordPolicy.ok) { setNotice(newPasswordPolicy.message); return; }
    if (activationMode && password !== confirmPassword) { setNotice("تأكيد كلمة المرور غير مطابق."); return; }
    setBusy("register"); setNotice("");
    try {
      const result = await createUserWithEmailAndPassword(auth, officialEmail.trim().toLowerCase(), password);
      if (activationMode) {
        await bridgeSession(result.user, { completePasswordSetup: true });
      } else {
        await sendEmailVerification(result.user);
        await signOut(auth);
        setNotice("تم إنشاء الحساب. افتح رسالة التأكيد في بريدك الرسمي ثم عد للدخول بكلمة المرور.");
      }
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "auth/email-already-in-use" && activationMode) {
        try {
          const signed = await signInWithEmailAndPassword(auth, officialEmail.trim().toLowerCase(), password);
          await updatePassword(signed.user, password);
          await completePasswordSetup.mutateAsync();
          await bridgeSession(signed.user, { completePasswordSetup: true });
          return;
        } catch (inner) {
          setNotice(firebaseErrorMessage(inner, "الحساب موجود. استخدم كلمة المرور الحالية أو أعد التعيين عبر OTP."));
          return;
        }
      }
      setNotice(firebaseErrorMessage(error, "تعذر إنشاء حساب البريد."));
    }
    finally { setBusy(null); }
  };

  return <div className="mt-6 space-y-4 rounded-2xl border border-[#d9e5d9] bg-[#f7faf5] p-5">
    <div><p className="text-sm font-bold text-[#29463b]">{activationMode ? "تعيين كلمة مرور جديدة" : "الدخول عبر Google أو البريد"}</p><p className="mt-1 text-xs leading-6 text-[#718078]">{activationMode ? "بعد إثبات الهوية يلزم تعيين كلمة مرور جديدة قبل المتابعة. تبقى OTP والبصمة متاحتين لاحقاً." : "استخدم بريدك الرسمي نفسه. يبقى رمز OTP والبصمة متاحين كخيارات مستقلة."}</p>{Boolean(activationToken) && <p className="mt-2 rounded-lg bg-[#e9f2ea] p-2 text-xs leading-5 text-[#2f694f]">تم إثبات هويتك. يمكنك إنشاء كلمة المرور الآن دون انتظار رسالة تأكيد البريد؛ رمز التفعيل صالح لمرة واحدة.</p>}</div>
    {!activationMode && <Button type="button" className="w-full bg-white text-[#29463b] shadow-sm hover:bg-[#f3f6f0]" variant="outline" disabled={!firebaseWebConfigReady || busy !== null || exchange.isPending} onClick={() => void signInGoogle()}><Chrome className="ml-2 h-4 w-4" />{busy === "google" ? "جارٍ فتح Google…" : "الدخول عبر Google الرسمي"}</Button>}
    {!activationMode && <div className="relative py-1 text-center text-xs text-[#8a978e]"><span className="relative z-10 bg-[#f7faf5] px-2">أو</span><div className="absolute inset-x-0 top-1/2 border-t border-[#d9e5d9]" /></div>}
    <label className="block text-xs font-bold text-[#52665a]">{activationMode ? "كلمة المرور الجديدة" : "كلمة المرور"}<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={activationMode ? "new-password" : "current-password"} placeholder="8 خانات على الأقل" className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm" /></label>
    <p className="mt-1 text-[11px] leading-5 text-[#718078]">{PASSWORD_POLICY_HINT}</p>
    {activationMode && <label className="block text-xs font-bold text-[#52665a]">تأكيد كلمة المرور<input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" placeholder="أعد كتابة كلمة المرور" className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm" /></label>}
    <div className={`grid gap-3 ${activationMode ? "" : "sm:grid-cols-2"}`}><Button type="button" className="bg-[#006c35] hover:bg-[#00552b]" disabled={!firebaseWebConfigReady || busy !== null || exchange.isPending} onClick={() => void (activationMode ? registerEmail() : signInEmail())}><KeyRound className="ml-2 h-4 w-4" />{busy === "signin" || busy === "register" ? "جارٍ الحفظ…" : activationMode ? "حفظ كلمة المرور ومتابعة الدخول" : "دخول بالبريد"}</Button>{!activationMode && <Button type="button" variant="outline" disabled={!firebaseWebConfigReady || busy !== null || exchange.isPending} onClick={() => void registerEmail()}><MailCheck className="ml-2 h-4 w-4" />{busy === "register" ? "جارٍ الإنشاء…" : "إنشاء كلمة مرور"}</Button>}</div>
    {notice && <p role="status" className="rounded-xl bg-white p-3 text-xs leading-6 text-[#426253]">{notice}</p>}
  </div>;
};
