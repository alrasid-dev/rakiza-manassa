export type TraineeReadinessInput = {
  expectedEndAt: Date | null;
  openDelayCount: number;
  incompleteTaskCount: number;
};

export type TraineeTransferState = "ready" | "not_ready";

export function addDays(startAt: Date, days: number) {
  const result = new Date(startAt);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function assessTransferReadiness(input: TraineeReadinessInput) {
  if (!input.expectedEndAt) return { state: "not_ready" as TraineeTransferState, reasons: ["لم تُثبت مدة الملازمة وتاريخ نهايتها بعد."] };
  const reasons: string[] = [];
  if (input.openDelayCount > 0) reasons.push(`لديه ${input.openDelayCount} متعثرات مفتوحة.`);
  if (input.incompleteTaskCount > 0) reasons.push(`لديه ${input.incompleteTaskCount} مهام غير مكتملة.`);
  return reasons.length ? { state: "not_ready" as TraineeTransferState, reasons } : { state: "ready" as TraineeTransferState, reasons: [] };
}

export function isDueWithinSevenDays(expectedEndAt: Date | null, now: Date) {
  if (!expectedEndAt) return false;
  const sevenDaysLater = addDays(now, 7);
  return expectedEndAt >= now && expectedEndAt <= sevenDaysLater;
}
