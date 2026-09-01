import { and, desc, eq, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { attendanceRecords, notifications, personProfiles, scheduledJobConfigs } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";
import { sendSafeScheduledFailure } from "./safe-scheduled-failure";
import { attendanceConfirmationCadence, shouldRequestAttendanceConfirmation } from "../attendance-confirmation-policy";

const ACTIVE_REMOTE_MODES = ["remote", "mixed"] as const;

export type AttendanceAudience = "employees" | "trainees" | "judges" | "all" | "employees,trainees" | "employees,judges" | "trainees,judges" | "employees,trainees,judges";

type AttendanceCycleResult = {
  scanned: number;
  notified: number;
  skipped: number;
  policy: "enabled";
};

export async function runAttendanceConfirmationCycle(now = new Date(), targetProfileId?: number | null, audience: AttendanceAudience = "all"): Promise<AttendanceCycleResult> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");

  const selectedAudiences = audience === "all" || audience === "employees,trainees,judges" ? ["employees", "trainees", "judges"] : audience.split(",");
  const audienceFilter = selectedAudiences.length === 3 ? undefined : or(...selectedAudiences.map(selected => selected === "employees" ? eq(personProfiles.personType, "administrative") : selected === "trainees" ? eq(personProfiles.personType, "trainee") : eq(personProfiles.personType, "judge")));
  const profileFilters = [eq(personProfiles.status, "active"), or(eq(personProfiles.attendanceMode, ACTIVE_REMOTE_MODES[0]), eq(personProfiles.attendanceMode, ACTIVE_REMOTE_MODES[1])), ...(audienceFilter ? [audienceFilter] : [])];
  if (targetProfileId !== undefined && targetProfileId !== null) profileFilters.push(eq(personProfiles.id, targetProfileId));
  const profiles = await db.select().from(personProfiles).where(and(...profileFilters));
  const recentRequests = await db
    .select({ profileId: notifications.profileId, sentAt: notifications.sentAt })
    .from(notifications)
    .where(eq(notifications.category, "attendance_confirmation"))
    .orderBy(desc(notifications.sentAt));
  const lastRequestedByProfile = new Map<number, Date>();
  for (const request of recentRequests) {
    if (request.profileId != null && !lastRequestedByProfile.has(request.profileId)) lastRequestedByProfile.set(request.profileId, request.sentAt);
  }

  let notified = 0;
  let skipped = 0;
  for (const profile of profiles) {
    const lastRequestedAt = lastRequestedByProfile.get(profile.id) ?? null;
    const recentAttendance = await db
      .select({ status: attendanceRecords.status, recordDate: attendanceRecords.recordDate })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.profileId, profile.id))
      .orderBy(desc(attendanceRecords.recordDate));
    const confirmedDays = recentAttendance.filter(record => record.status === "present" || record.status === "late").slice(0, 30).length;
    const cadence = attendanceConfirmationCadence({ enabled: true, consecutiveConfirmedDays: confirmedDays, ignoredRecentConfirmations: 0 });
    if (!shouldRequestAttendanceConfirmation({ enabled: true, lastRequestedAt, now, cadence })) {
      skipped += 1;
      continue;
    }
    const dayKey = now.toISOString().slice(0, 10);
    const dedupeKey = `attendance-confirmation-${profile.id}-${dayKey}`;
    const result = await db.insert(notifications).values({
      profileId: profile.id,
      category: "attendance_confirmation",
      title: "تأكيد بدء العمل",
      body: "يرجى تأكيد بدء العمل خلال 20 دقيقة من استلام هذا التنبيه. إذا تعذر التأكيد، أضف سبباً من شاشة الحضور.",
      dedupeKey,
    });
    if (Number(result[0].affectedRows) === 1) notified += 1;
  }
  return { scanned: profiles.length, notified, skipped, policy: "enabled" };
}

function nowForAttendanceCycle() {
  return new Date();
}

export async function handleAttendanceConfirmationSchedule(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });
    const config = (await db.select().from(scheduledJobConfigs).where(eq(scheduledJobConfigs.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
    if (!config) return res.json({ ok: true, skipped: "orphan" });
    if (!config.isActive || config.jobType !== "attendance_confirmation") return res.json({ ok: true, skipped: "disabled-or-mismatch" });
    const result = await runAttendanceConfirmationCycle(nowForAttendanceCycle(), config.attendanceTargetProfileId, (config.attendanceTargetAudience as AttendanceAudience) || "all");
    return res.json({ ok: true, job: "attendance_confirmation", ...result, targetProfileId: config.attendanceTargetProfileId ?? null, taskUid: user.taskUid });
  } catch (error) {
    return sendSafeScheduledFailure(res, { publicCode: "attendance-confirmation-failed", job: "attendance_confirmation", url: req.originalUrl, error });
  }
}
