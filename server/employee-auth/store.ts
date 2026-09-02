import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { ApprovedEmployee, EmployeeRecord, EmployeeSession, OneTimeChallenge } from "./types";

/** توحيد كتابة الاسم العربي قبل مطابقته مع سجل الموظفين المعتمدين. */
export function normalizeStaffName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

export function hashSecret(secret: string, salt = randomBytes(16).toString("hex")) {
  const digest = scryptSync(secret, salt, 32).toString("hex");
  return `${salt}:${digest}`;
}

export function secretsMatch(secret: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const actual = scryptSync(secret, salt, 32);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * قائمة الموظفين المعتمدين مسبقاً (مصدر تجريبي في الذاكرة).
 * هنا تتم قراءة الأسماء عند التسجيل الأول — يُرفض أي اسم غير موجود.
 */
export const APPROVED_EMPLOYEES: ApprovedEmployee[] = [
  { fullName: "عبدالله محمد الحميدي", department: "شؤون الموظفين" },
  { fullName: "نورة سعد العتيبي", department: "الدعم القضائي" },
  { fullName: "فهد عبدالعزيز القحطاني", department: "إدارة المهام" },
];

const employees = new Map<string, EmployeeRecord>();
const challenges = new Map<string, OneTimeChallenge>();
const sessions = new Map<string, EmployeeSession>();
const pinIndex = new Map<string, string>();
const biometricIndex = new Map<string, string>();

export function resetEmployeeAuthStore() {
  employees.clear();
  challenges.clear();
  sessions.clear();
  pinIndex.clear();
  biometricIndex.clear();
}

export function listApprovedEmployees() {
  return APPROVED_EMPLOYEES.map(item => ({ ...item }));
}

export function findApprovedEmployee(fullName: string) {
  const normalized = normalizeStaffName(fullName);
  return APPROVED_EMPLOYEES.find(item => normalizeStaffName(item.fullName) === normalized);
}

export function getEmployeeById(id: string) {
  return employees.get(id);
}

export function getEmployeeByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return [...employees.values()].find(item => item.email === normalized);
}

export function getEmployeeByPin(pin: string) {
  const id = pinIndex.get(hashLookupKey(pin));
  return id ? employees.get(id) : undefined;
}

export function getEmployeeByBiometric(credentialId: string) {
  const id = biometricIndex.get(credentialId);
  return id ? employees.get(id) : undefined;
}

function hashLookupKey(value: string) {
  return hashSecret(value, "pin-index");
}

export function registerEmployee(record: EmployeeRecord, pin: string) {
  if (pinIndex.has(hashLookupKey(pin))) throw new Error("رمز PIN مستخدم. اختر رمزاً من ستة أرقام غير مستخدم.");
  employees.set(record.id, record);
  pinIndex.set(hashLookupKey(pin), record.id);
}

export function rebindPin(employeeId: string, pin: string) {
  for (const [key, id] of pinIndex.entries()) {
    if (id === employeeId) pinIndex.delete(key);
  }
  if (pinIndex.has(hashLookupKey(pin))) throw new Error("رمز PIN مستخدم. اختر رمزاً من ستة أرقام غير مستخدم.");
  pinIndex.set(hashLookupKey(pin), employeeId);
}

export function updateEmployee(record: EmployeeRecord) {
  employees.set(record.id, record);
}

export function setBiometricCredential(employeeId: string, credentialId: string) {
  const employee = employees.get(employeeId);
  if (!employee) throw new Error("الحساب غير موجود.");
  if (employee.biometricCredentialId) biometricIndex.delete(employee.biometricCredentialId);
  employee.biometricCredentialId = credentialId;
  biometricIndex.set(credentialId, employeeId);
  employees.set(employeeId, employee);
}

export function saveChallenge(id: string, challenge: OneTimeChallenge) {
  challenges.set(id, challenge);
}

export function getChallenge(id: string) {
  return challenges.get(id);
}

export function consumeChallenge(id: string) {
  const challenge = challenges.get(id);
  if (challenge) challenge.consumed = true;
}

export function saveSession(session: EmployeeSession) {
  sessions.set(session.token, session);
}

export function getSession(token: string) {
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return undefined;
  }
  return session;
}

export function deleteSession(token: string) {
  sessions.delete(token);
}
