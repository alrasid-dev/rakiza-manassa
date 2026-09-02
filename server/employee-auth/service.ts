import { randomBytes, randomInt, randomUUID } from "node:crypto";
import {
  consumeChallenge,
  deleteSession,
  findApprovedEmployee,
  getChallenge,
  getEmployeeByBiometric,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByPin,
  getSession,
  hashSecret,
  listApprovedEmployees,
  rebindPin,
  registerEmployee,
  saveChallenge,
  saveSession,
  secretsMatch,
  setBiometricCredential,
  updateEmployee,
} from "./store";
import type { EmployeeRecord } from "./types";

const SESSION_MS = 12 * 60 * 60 * 1000;
const OTP_MS = 10 * 60 * 1000;
const COOKIE = "employee_session";

function requirePin(pin: string) {
  if (!/^\d{6}$/.test(pin)) throw new Error("رمز PIN يجب أن يكون 6 أرقام.");
}

function publicEmployee(employee: EmployeeRecord) {
  return {
    id: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    hasBiometric: Boolean(employee.biometricCredentialId),
    notificationsEnabled: employee.notificationsEnabled,
  };
}

function issueSession(employeeId: string) {
  const token = randomBytes(24).toString("hex");
  saveSession({ token, employeeId, expiresAt: Date.now() + SESSION_MS });
  return token;
}

function issueOneTimeCode(employeeId: string, purpose: "registration" | "password_recovery") {
  const code = String(randomInt(100000, 1000000));
  const id = randomUUID();
  saveChallenge(id, {
    employeeId,
    purpose,
    codeHash: hashSecret(code),
    expiresAt: Date.now() + OTP_MS,
    consumed: false,
  });
  return { challengeId: id, code, expiresInSeconds: OTP_MS / 1000 };
}

/** التسجيل الأول: يُرفض فوراً إن لم يطابق الاسم سجل الموظفين المعتمدين. */
export function registerStaff(input: { fullName: string; email: string; password: string; pin: string }) {
  const approved = findApprovedEmployee(input.fullName);
  if (!approved) throw new Error("الاسم غير مطابق لسجل الموظفين المعتمدين. لا يمكن إكمال التسجيل.");
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("صيغة البريد غير صحيحة.");
  if (input.password.trim().length < 8) throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
  requirePin(input.pin);
  if (getEmployeeByEmail(email)) throw new Error("يوجد حساب مسجّل بهذا البريد. استخدم الدخول اليومي أو الاستعادة.");
  const record: EmployeeRecord = {
    id: randomUUID(),
    fullName: approved.fullName,
    email,
    passwordHash: hashSecret(input.password),
    pinHash: hashSecret(input.pin),
    biometricCredentialId: null,
    notificationsEnabled: false,
    createdAt: new Date().toISOString(),
  };
  registerEmployee(record, input.pin);
  // OTP مجاني لمرة واحدة بعد قبول التسجيل فقط — لا يُطلب في الدخول اليومي.
  const otp = issueOneTimeCode(record.id, "registration");
  return {
    employee: publicEmployee(record),
    oneTimeVerification: otp,
    message: "تم قبول التسجيل. هذا رمز تحقق مجاني لمرة واحدة فقط.",
  };
}

export function confirmOneTimeCode(input: { challengeId: string; code: string }) {
  const challenge = getChallenge(input.challengeId);
  if (!challenge || challenge.consumed) throw new Error("رمز التحقق غير صالح أو سبق استخدامه.");
  if (challenge.expiresAt < Date.now()) throw new Error("انتهت صلاحية رمز التحقق المجاني.");
  if (!secretsMatch(input.code, challenge.codeHash)) throw new Error("رمز التحقق غير صحيح.");
  consumeChallenge(input.challengeId);
  const token = issueSession(challenge.employeeId);
  return { verified: true, token, cookieName: COOKIE, purpose: challenge.purpose };
}

/** استعادة كلمة المرور فقط: يُظهر OTP مجاني لمرة واحدة. ممنوع في الدخول اليومي. */
export function startPasswordRecovery(email: string) {
  const employee = getEmployeeByEmail(email);
  if (!employee) throw new Error("لا يوجد حساب بهذا البريد.");
  const otp = issueOneTimeCode(employee.id, "password_recovery");
  return { challengeId: otp.challengeId, code: otp.code, expiresInSeconds: otp.expiresInSeconds, message: "رمز استعادة مجاني لمرة واحدة. لن يُطلب في الدخول اليومي." };
}

export function completePasswordRecovery(input: { challengeId: string; code: string; password: string; pin: string }) {
  const result = confirmOneTimeCode({ challengeId: input.challengeId, code: input.code });
  const session = getSession(result.token);
  const employee = session ? getEmployeeById(session.employeeId) : undefined;
  if (!employee) throw new Error("تعذر تحديث الحساب.");
  requirePin(input.pin);
  if (input.password.trim().length < 8) throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
  employee.passwordHash = hashSecret(input.password);
  employee.pinHash = hashSecret(input.pin);
  rebindPin(employee.id, input.pin);
  updateEmployee(employee);
  return { success: true, token: result.token, cookieName: COOKIE };
}

/**
 * الدخول اليومي بالـ PIN فقط.
 * لا بريد، لا OTP، لا 2FA — البحث يتم بمطابقة PIN المخزّن.
 */
export function loginWithPin(pin: string) {
  requirePin(pin);
  const employee = getEmployeeByPin(pin);
  if (!employee || !secretsMatch(pin, employee.pinHash)) throw new Error("رمز PIN غير صحيح.");
  return { token: issueSession(employee.id), cookieName: COOKIE, employee: publicEmployee(employee) };
}

/**
 * الدخول اليومي بالبصمة الحيوية.
 * تُقارن بصمة الجهاز (credentialId) مع السجل المخزّن — لا تُرسل صورة البصمة إلى الخادم.
 */
export function loginWithBiometric(credentialId: string) {
  const id = credentialId.trim();
  if (!id) throw new Error("لم يُستلم معرف البصمة من الجهاز.");
  const employee = getEmployeeByBiometric(id);
  if (!employee) throw new Error("لا توجد بصمة مسجّلة. سجّل البصمة من الإعدادات بعد أول تسجيل.");
  return { token: issueSession(employee.id), cookieName: COOKIE, employee: publicEmployee(employee) };
}

export function registerBiometric(token: string, credentialId: string) {
  const session = requireSession(token);
  setBiometricCredential(session.employeeId, credentialId.trim());
  return { success: true };
}

export function currentEmployee(token: string | undefined) {
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  const employee = getEmployeeById(session.employeeId);
  return employee ? publicEmployee(employee) : null;
}

export function logout(token: string | undefined) {
  if (token) deleteSession(token);
  return { success: true };
}

/** الإشعارات منفصلة تماماً عن الدخول — تُضبط من صفحة الإعدادات فقط. */
export function setNotificationPreference(token: string, enabled: boolean) {
  const session = requireSession(token);
  const employee = getEmployeeById(session.employeeId);
  if (!employee) throw new Error("الحساب غير موجود.");
  employee.notificationsEnabled = enabled;
  updateEmployee(employee);
  return { notificationsEnabled: employee.notificationsEnabled };
}

export function approvedDirectory() {
  return listApprovedEmployees();
}

function requireSession(token: string) {
  const session = getSession(token);
  if (!session) throw new Error("يلزم تسجيل الدخول لفتح الإعدادات.");
  return session;
}

export const EMPLOYEE_SESSION_COOKIE = COOKIE;
