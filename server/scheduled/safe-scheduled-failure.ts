import type { Response } from "express";

export function sendSafeScheduledFailure(res: Response, input: { publicCode: string; job: string; url: string; error: unknown }) {
  console.error("[scheduled-task] failed", { job: input.job, url: input.url, error: input.error });
  return res.status(500).json({ error: input.publicCode, timestamp: new Date().toISOString() });
}
