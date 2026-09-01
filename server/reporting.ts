export type ReportPeriod = "daily" | "weekly" | "monthly" | "historical";

export function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function reportStart(period: ReportPeriod, now: Date) {
  const start = startOfUtcDay(now);
  if (period === "daily") return start;
  if (period === "weekly") {
    const day = start.getUTCDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - offset);
    return start;
  }
  if (period === "monthly") return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  return new Date(0);
}

export function previousReportRange(period: Exclude<ReportPeriod, "historical">, now: Date) {
  const currentStart = reportStart(period, now);
  const previousEnd = currentStart;
  const previousStart = new Date(currentStart);
  if (period === "daily") previousStart.setUTCDate(previousStart.getUTCDate() - 1);
  else if (period === "weekly") previousStart.setUTCDate(previousStart.getUTCDate() - 7);
  else previousStart.setUTCMonth(previousStart.getUTCMonth() - 1);
  return { startAt: previousStart, endAt: previousEnd };
}
