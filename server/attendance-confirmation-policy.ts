export type AttendanceConfirmationCadence = "every_two_days" | "weekly" | "biweekly" | "monthly";

export type AttendanceConfirmationPolicyInput = {
  enabled: boolean;
  consecutiveConfirmedDays: number;
  ignoredRecentConfirmations: number;
};

/**
 * يحدد فترة طلب تأكيد الحضور التالية. لا ينشئ جدولة بحد ذاته؛ طبقة Heartbeat
 * هي المسؤولة عن الاستدعاء بعد اعتماد السياسة ونشر النسخة.
 */
export function attendanceConfirmationCadence(input: AttendanceConfirmationPolicyInput): AttendanceConfirmationCadence | "disabled" {
  if (!input.enabled) return "disabled";
  if (input.ignoredRecentConfirmations > 0 || input.consecutiveConfirmedDays < 5) return "every_two_days";
  if (input.consecutiveConfirmedDays < 15) return "weekly";
  if (input.consecutiveConfirmedDays < 30) return "biweekly";
  return "monthly";
}

export function cadenceIntervalDays(cadence: AttendanceConfirmationCadence | "disabled") {
  return cadence === "every_two_days" ? 2 : cadence === "weekly" ? 7 : cadence === "biweekly" ? 14 : cadence === "monthly" ? 30 : 0;
}

export function shouldRequestAttendanceConfirmation(input: { enabled: boolean; lastRequestedAt: Date | null; now: Date; cadence: AttendanceConfirmationCadence | "disabled" }) {
  if (!input.enabled || input.cadence === "disabled") return false;
  if (!input.lastRequestedAt) return true;
  const elapsedDays = (input.now.getTime() - input.lastRequestedAt.getTime()) / (24 * 60 * 60 * 1000);
  return elapsedDays >= cadenceIntervalDays(input.cadence);
}

export function attendanceConfirmationDeadline(startAt: Date, windowMinutes = 20) {
  return new Date(startAt.getTime() + windowMinutes * 60 * 1000);
}

export function attendanceConfirmationPolicyDefaults() {
  return { enabled: true, confirmationWindowMinutes: 20, ignoredConfirmationPenalty: -1, cadence: "every_two_days" as const };
}

export const attendanceConfirmationPolicyDescription = "تأكيد الحضور خلال 20 دقيقة؛ يبدأ الطلب كل يومين، ثم أسبوعياً، ثم كل أسبوعين، ثم شهرياً وفق الانضباط، مع إمكانية الإيقاف والتخصيص من السياسة التشغيلية.";

export default {
  attendanceConfirmationCadence,
  cadenceIntervalDays,
  shouldRequestAttendanceConfirmation,
  attendanceConfirmationDeadline,
  attendanceConfirmationPolicyDefaults,
};

