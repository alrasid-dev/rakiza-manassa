import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(async () => ({ uid: "firebase-uid-1", email: "employee@moj.gov.sa", name: "موظف اختبار", provider: "google.com" as const })),
  link: vi.fn(async () => ({ user: { id: 42, openId: "otp:employee@moj.gov.sa", name: "موظف اختبار" }, profileId: 8 })),
  createSessionToken: vi.fn(async () => "rakiza-session"),
  issueActivation: vi.fn(async () => ({ token: "activation-token-12345678901234567890", expiresInSeconds: 600 })),
  consumeActivation: vi.fn(async () => ({ consumed: true as const })),
}));

vi.mock("./firebase-auth-service", () => ({ verifyFirebaseIdToken: mocks.verify, linkFirebaseIdentity: mocks.link }));
vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, issueAuthActivationToken: mocks.issueActivation, consumeAuthActivationToken: mocks.consumeActivation };
});
vi.mock("./_core/sdk", async importOriginal => {
  const actual = await importOriginal<typeof import("./_core/sdk")>();
  return { ...actual, sdk: { ...actual.sdk, createSessionToken: mocks.createSessionToken } };
});

import { courtRouter } from "./routers/court";

function caller(user: { id: number; email: string; openId: string; name: string } | null = null) {
  const res = { cookie: vi.fn() };
  const req = { headers: {}, protocol: "https", get: vi.fn(() => "https") };
  return { api: courtRouter.createCaller({ req, res, user } as never), res };
}

describe("جسر مصادقة Firebase", () => {
  it("يصدر رمز تفعيل قصير العمر من جلسة المستخدم الشخصية", async () => {
    const { api } = caller({ id: 42, email: "employee@moj.gov.sa", openId: "otp:employee@moj.gov.sa", name: "موظف اختبار" });
    await expect(api.firebaseAuth.issueActivation()).resolves.toEqual({ token: "activation-token-12345678901234567890", expiresInSeconds: 600, message: "رمز التفعيل صالح لمدة 10 دقائق ولمرة واحدة فقط." });
    expect(mocks.issueActivation).toHaveBeenCalledWith({ userId: 42 });
  });

  it("يتحقق من الرمز ويربط الحساب ثم ينشئ جلسة رَكيزة", async () => {
    const { api, res } = caller();
    await expect(api.firebaseAuth.exchange({ idToken: "x".repeat(300) })).resolves.toEqual({ verified: true, provider: "google.com" });
    expect(mocks.verify).toHaveBeenCalledWith("x".repeat(300), { allowUnverifiedEmail: false });
    expect(mocks.link).toHaveBeenCalledWith(expect.objectContaining({ email: "employee@moj.gov.sa" }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("otp:employee@moj.gov.sa", expect.objectContaining({ name: "موظف اختبار" }));
    expect(res.cookie).toHaveBeenCalledWith(expect.any(String), "rakiza-session", expect.any(Object));
  });

  it("يسمح بالبريد غير المؤكد فقط مع رمز التفعيل وجلسة مطابقة", async () => {
    const { api, res } = caller({ id: 42, email: "employee@moj.gov.sa", openId: "otp:employee@moj.gov.sa", name: "موظف اختبار" });
    await expect(api.firebaseAuth.exchange({ idToken: "x".repeat(300), activationToken: "activation-token-12345678901234567890" })).resolves.toEqual({ verified: true, provider: "google.com" });
    expect(mocks.verify).toHaveBeenCalledWith("x".repeat(300), { allowUnverifiedEmail: true });
    expect(mocks.consumeActivation).toHaveBeenCalledWith({ userId: 42, token: "activation-token-12345678901234567890" });
    expect(res.cookie).toHaveBeenCalled();
  });
});
