import webpush, { type PushSubscription } from "web-push";
import { and, eq } from "drizzle-orm";
import { pushSubscriptions } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { sendFcmToProfile } from "./fcm-service";

export type StoredPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type PushAction = { action: "open-tasks" | "open-notifications"; title: string };

let configured = false;

function configureWebPush() {
  if (configured) return true;
  if (!ENV.vapidSubject || !ENV.vapidPublicKey || !ENV.vapidPrivateKey) return false;
  webpush.setVapidDetails(ENV.vapidSubject, ENV.vapidPublicKey, ENV.vapidPrivateKey);
  configured = true;
  return true;
}

export function getWebPushPublicKey() {
  return ENV.vapidPublicKey;
}

export async function upsertPushSubscription(input: {
  profileId: number;
  subscription: StoredPushSubscription;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(pushSubscriptions).values({
    profileId: input.profileId,
    endpoint: input.subscription.endpoint,
    p256dh: input.subscription.keys.p256dh,
    auth: input.subscription.keys.auth,
    userAgent: input.userAgent?.slice(0, 512) ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      profileId: input.profileId,
      p256dh: input.subscription.keys.p256dh,
      auth: input.subscription.keys.auth,
      userAgent: input.userAgent?.slice(0, 512) ?? null,
    },
  });
  return { success: true } as const;
}

export async function removePushSubscription(profileId: number, endpoint: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.profileId, profileId), eq(pushSubscriptions.endpoint, endpoint)));
  return { success: true } as const;
}

export async function sendPushToProfile(profileId: number, payload: { title: string; body: string; url?: string; tag?: string; actions?: PushAction[] }) {
  if (!configureWebPush()) return { sent: 0, removed: 0, skipped: true };
  const db = await getDb();
  if (!db) return { sent: 0, removed: 0, skipped: true };
  const rows = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.profileId, profileId));
  let sent = 0;
  let removed = 0;
  for (const row of rows) {
    const subscription: PushSubscription = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      sent += 1;
    } catch (error: any) {
      const statusCode = Number(error?.statusCode);
      if (statusCode === 404 || statusCode === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, row.id));
        removed += 1;
      } else {
        console.warn("[WebPush] تعذر إرسال الإشعار", { profileId, statusCode });
      }
    }
  }
  return { sent, removed, skipped: false };
}

export async function sendPushForNotification(profileId: number | null, payload: { title: string; body: string; url?: string; tag?: string; actions?: PushAction[] }) {
  if (!profileId) return { sent: 0, removed: 0, skipped: true };
  const [webResult, fcmResult] = await Promise.all([
    sendPushToProfile(profileId, payload),
    sendFcmToProfile(profileId, payload),
  ]);
  return {
    sent: webResult.sent + fcmResult.sent,
    removed: webResult.removed + fcmResult.removed,
    skipped: webResult.skipped && fcmResult.skipped,
  };
}
