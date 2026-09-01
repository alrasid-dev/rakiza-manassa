import { describe, expect, it, vi } from "vitest";
import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

const exchangeCodeForToken = vi.hoisted(() => vi.fn());
vi.mock("./sdk", () => ({ sdk: { exchangeCodeForToken } }));
vi.mock("../db", () => ({ upsertUser: vi.fn() }));

import { registerOAuthRoutes } from "./oauth";

describe("حالة رجوع OAuth", () => {
  it("يرفض الرجوع الذي لا يطابق nonce المحفوظ ولا يتبادل رمز الدخول", async () => {
    const routes = new Map<string, Function>();
    registerOAuthRoutes({ get: (path: string, handler: Function) => { routes.set(path, handler); } } as never);
    const status = vi.fn(() => ({ json }));
    const json = vi.fn();
    const redirect = vi.fn();
    const handler = routes.get("/api/oauth/callback");
    await handler?.({ query: { code: "authorization-code", state: encodeOAuthState({ redirectUri: "https://court.example", nonce: "correct-nonce" }) }, headers: { cookie: `${OAUTH_STATE_COOKIE}=different-nonce` } }, { status, redirect } as never);
    expect(redirect).toHaveBeenCalledWith(302, "/login?auth_error=expired");
    expect(status).not.toHaveBeenCalled();
    expect(exchangeCodeForToken).not.toHaveBeenCalled();
  });
});
