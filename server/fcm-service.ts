import { and, eq } from "drizzle-orm";
import { SignJWT, importPKCS8 } from "jose";
import { fcmTokens } from "../drizzle/schema";
import { getDb } from "./db";

export type FcmPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: "open-tasks" | "open-notifications"; title: string }>;
};

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let accessTokenCache: { token: string; expiresAt: number } | null = null;

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

async function getAccessToken(account: ServiceAccount) {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(account.private_key.replace(/\\n/g, "\n"), "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(account.client_email)
    .setSubject(account.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .sign(key);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error("تعذر اعتماد خادم Firebase للإرسال.");
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error("لم يُرجع Firebase رمز وصول صالحاً.");
  accessTokenCache = { token: payload.access_token, expiresAt: Date.now() + Math.max(60, payload.expires_in ?? 3600) * 1000 };
  return payload.access_token;
}

export async function upsertFcmToken(input: { profileId: number; token: string; platform?: string; userAgent?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(fcmTokens).values({
    profileId: input.profileId,
    token: input.token,
    platform: input.platform?.slice(0, 32) ?? "web",
    userAgent: input.userAgent?.slice(0, 512) ?? null,
  }).onDuplicateKeyUpdate({ set: { profileId: input.profileId, platform: input.platform?.slice(0, 32) ?? "web", userAgent: input.userAgent?.slice(0, 512) ?? null } });
  return { success: true as const };
}

export async function removeFcmToken(profileId: number, token: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.delete(fcmTokens).where(and(eq(fcmTokens.profileId, profileId), eq(fcmTokens.token, token)));
  return { success: true as const };
}

export async function sendFcmToProfile(profileId: number, payload: FcmPayload) {
  const account = getServiceAccount();
  const db = await getDb();
  if (!account || !db) return { sent: 0, removed: 0, skipped: true as const };
  const rows = await db.select().from(fcmTokens).where(eq(fcmTokens.profileId, profileId));
  if (!rows.length) return { sent: 0, removed: 0, skipped: false as const };
  const accessToken = await getAccessToken(account);
  let sent = 0;
  let removed = 0;
  for (const row of rows) {
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ message: { token: row.token, notification: { title: payload.title, body: payload.body }, data: { url: payload.url ?? "/", tag: payload.tag ?? "rakiza", actions: JSON.stringify(payload.actions ?? []) }, webpush: { fcmOptions: { link: payload.url ?? "/" } } } }),
    });
    if (response.ok) {
      sent += 1;
    } else if (response.status === 404 || response.status === 410) {
      await db.delete(fcmTokens).where(eq(fcmTokens.id, row.id));
      removed += 1;
    } else {
      console.warn("[FCM] تعذر إرسال إشعار إلى جهاز", { profileId, status: response.status });
    }
  }
  return { sent, removed, skipped: false as const };
}
