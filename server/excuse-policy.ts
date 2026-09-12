/** سياسة الاستئذان (Asia/Riyadh): مرة يومياً، 240 دقيقة للطلب، 1000 دقيقة شهرياً، تصعيد بعد تجاوز 3 استئذانات. */

export const EXCUSE_MAX_MINUTES_PER_REQUEST = 240;
export const EXCUSE_MONTHLY_CAP_MINUTES = 1000;
export const EXCUSE_ESCALATION_AFTER_COUNT = 3;

export type ExcuseRequestLike = {
  requestType: "leave" | "permission";
  status: "pending" | "approved" | "rejected" | "active" | "completed";
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
};

export function riyadhParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
    minute: Number(parts.minute),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    monthKey: `${parts.year}-${parts.month}`,
  };
}

export function durationMinutesBetween(startAt: Date, endAt: Date) {
  return Math.max(0, Math.ceil((endAt.getTime() - startAt.getTime()) / 60_000));
}

function countsTowardCaps(status: ExcuseRequestLike["status"]) {
  return status !== "rejected";
}

export function evaluateExcusePolicy(input: {
  requestType: "leave" | "permission";
  startAt: Date;
  endAt: Date;
  existing: ExcuseRequestLike[];
  now?: Date;
}) {
  if (input.requestType !== "permission") {
    return {
      ok: true as const,
      durationMinutes: durationMinutesBetween(input.startAt, input.endAt),
      escalateToSecretary: false,
      monthlyCount: 0,
      monthlyMinutes: 0,
    };
  }
  if (input.endAt <= input.startAt) {
    return { ok: false as const, error: "يجب أن يأتي وقت نهاية الاستئذان بعد وقت البداية." };
  }
  const durationMinutes = durationMinutesBetween(input.startAt, input.endAt);
  if (durationMinutes > EXCUSE_MAX_MINUTES_PER_REQUEST) {
    return { ok: false as const, error: `الحد الأقصى للاستئذان الواحد ${EXCUSE_MAX_MINUTES_PER_REQUEST} دقيقة (انصراف مبكر أو حضور متأخر).` };
  }
  const dayKey = riyadhParts(input.startAt).dateKey;
  const monthKey = riyadhParts(input.startAt).monthKey;
  const sameDay = input.existing.filter(item => item.requestType === "permission" && countsTowardCaps(item.status) && riyadhParts(item.startAt).dateKey === dayKey);
  if (sameDay.length > 0) {
    return { ok: false as const, error: "يُسمح باستئذان واحد فقط في اليوم (بتوقيت الرياض)." };
  }
  const monthItems = input.existing.filter(item => item.requestType === "permission" && countsTowardCaps(item.status) && riyadhParts(item.startAt).monthKey === monthKey);
  const monthlyMinutes = monthItems.reduce((sum, item) => sum + item.durationMinutes, 0);
  if (monthlyMinutes + durationMinutes > EXCUSE_MONTHLY_CAP_MINUTES) {
    return { ok: false as const, error: `تجاوزت سقف الاستئذان الشهري (${EXCUSE_MONTHLY_CAP_MINUTES} دقيقة). المتبقي: ${Math.max(0, EXCUSE_MONTHLY_CAP_MINUTES - monthlyMinutes)} دقيقة.` };
  }
  const monthlyCount = monthItems.length;
  const escalateToSecretary = monthlyCount >= EXCUSE_ESCALATION_AFTER_COUNT;
  return {
    ok: true as const,
    durationMinutes,
    escalateToSecretary,
    monthlyCount: monthlyCount + 1,
    monthlyMinutes: monthlyMinutes + durationMinutes,
  };
}

export default { evaluateExcusePolicy, riyadhParts, durationMinutesBetween, EXCUSE_MAX_MINUTES_PER_REQUEST, EXCUSE_MONTHLY_CAP_MINUTES, EXCUSE_ESCALATION_AFTER_COUNT };
