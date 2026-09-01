import { eq } from "drizzle-orm";
import { internalMailScheduleJobs } from "../../drizzle/schema";
import { getDb } from "../db";
import { createHeartbeatJob } from "../_core/heartbeat";

/** ينشئ مشغلاً واحداً مشتركاً للمراسلات المؤجلة والمتكررة؛ لا ينشئ مهمة دورية لكل رسالة. */
export async function ensureInternalMailDispatchHeartbeatJob(input: { userSession: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const [existing] = await db.select().from(internalMailScheduleJobs).where(eq(internalMailScheduleJobs.jobKey, "internal-mail-dispatch")).limit(1);
  if (existing?.scheduleCronTaskUid) return { taskUid: existing.scheduleCronTaskUid, created: false };
  const heartbeat = await createHeartbeatJob({ name: "rakiza-internal-mail-dispatch", cron: "0 * * * * *", path: "/api/scheduled/internal-mail-dispatch", description: "إرسال بريد ركيزة الداخلي المؤجل والمتكرر كل دقيقة" }, input.userSession);
  if (existing) await db.update(internalMailScheduleJobs).set({ scheduleCronTaskUid: heartbeat.taskUid, updatedAt: new Date() }).where(eq(internalMailScheduleJobs.id, existing.id));
  else await db.insert(internalMailScheduleJobs).values({ jobKey: "internal-mail-dispatch", scheduleCronTaskUid: heartbeat.taskUid });
  return { taskUid: heartbeat.taskUid, created: true };
}
