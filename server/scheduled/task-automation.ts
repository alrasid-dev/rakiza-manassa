import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { scheduledJobConfigs } from "../../drizzle/schema";
import { activateScheduledLeaveStatuses, createRecurringTasksAndNotifications, escalateOverdueSupportTickets, escalateOverdueTasks, scanLinkedTraineeExcelSource } from "../court-service";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";
import { sendSafeScheduledFailure } from "./safe-scheduled-failure";
import { runAttendanceConfirmationCycle } from "./attendance-confirmation";

type AutomatedJob = "daily_task_reminder" | "task_escalation" | "leave_status_refresh" | "trainee_excel_sync" | "support_ticket_escalation" | "attendance_confirmation";

export function createTaskAutomationHandler(expectedJob: AutomatedJob) {
  return async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "database-unavailable" });
      const config = (await db.select().from(scheduledJobConfigs).where(eq(scheduledJobConfigs.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
      if (!config) return res.json({ ok: true, skipped: "orphan" });
      if (!config.isActive || config.jobType !== expectedJob) return res.json({ ok: true, skipped: "disabled-or-mismatch" });
      const result = expectedJob === "daily_task_reminder" ? await createRecurringTasksAndNotifications() : expectedJob === "task_escalation" ? await escalateOverdueTasks() : expectedJob === "trainee_excel_sync" ? await scanLinkedTraineeExcelSource() : expectedJob === "support_ticket_escalation" ? await escalateOverdueSupportTickets() : expectedJob === "attendance_confirmation" ? await runAttendanceConfirmationCycle(undefined, config.attendanceTargetProfileId, (config.attendanceTargetAudience as "employees" | "trainees" | "judges" | "all") || "all") : await activateScheduledLeaveStatuses();
      return res.json({ ok: true, job: expectedJob, ...result, taskUid: user.taskUid });
    } catch (error) {
      return sendSafeScheduledFailure(res, { publicCode: "task-automation-failed", job: expectedJob, url: req.originalUrl, error });
    }
  };
}

export const handleDailyTaskReminderSchedule = createTaskAutomationHandler("daily_task_reminder");
export const handleTaskEscalationSchedule = createTaskAutomationHandler("task_escalation");
export const handleLeaveStatusRefreshSchedule = createTaskAutomationHandler("leave_status_refresh");
export const handleTraineeExcelSyncSchedule = createTaskAutomationHandler("trainee_excel_sync");
export const handleSupportTicketEscalationSchedule = createTaskAutomationHandler("support_ticket_escalation");
