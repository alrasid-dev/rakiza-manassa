import { describe, expect, it } from "vitest";
import { SignJWT, importPKCS8 } from "jose";

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط");
  const account = JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string };
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error("ملف Firebase Service Account ناقص الحقول الأساسية");
  }
  return account;
}

describe("اعتماد Firebase Admin", () => {
  it("يقبل الاعتماد من نقطة OAuth الخفيفة دون كشف بيانات المفتاح", async () => {
    const account = readServiceAccount();
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await importPKCS8(account.private_key!.replace(/\\n/g, "\n"), "RS256");
    const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(account.client_email!)
      .setSubject(account.client_email!)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .sign(privateKey);

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    const payload = await response.json() as { access_token?: string };
    expect(response.ok).toBe(true);
    expect(payload.access_token).toMatch(/^ya29\./);
  }, 15000);

  it("يصل إلى Firestore بحساب الخادم دون إنشاء أو تعديل أي مستند", async () => {
    const account = readServiceAccount();
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await importPKCS8(account.private_key!.replace(/\\n/g, "\n"), "RS256");
    const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/datastore" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(account.client_email!)
      .setSubject(account.client_email!)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .sign(privateKey);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
    const tokenPayload = await tokenResponse.json() as { access_token?: string };
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(account.project_id!)}/databases/(default)/documents/rakizaUsers?pageSize=1`, { headers: { authorization: `Bearer ${tokenPayload.access_token ?? ""}` } });
    expect(response.ok).toBe(true);
  }, 15000);
});
