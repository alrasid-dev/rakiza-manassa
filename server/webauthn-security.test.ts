import { describe, expect, it } from "vitest";
import { WEBAUTHN_CHALLENGE_TTL_MS, isWebAuthnChallengeUsable } from "./webauthn-service";

describe("سياسة أمان WebAuthn", () => {
  it("يرفض التحدي المستهلك أو المنتهي ويقبل التحدي القصير غير المستهلك", () => {
    const now = Date.now();
    expect(isWebAuthnChallengeUsable({ consumedAt: null, expiresAt: new Date(now + 1000) }, now)).toBe(true);
    expect(isWebAuthnChallengeUsable({ consumedAt: new Date(), expiresAt: new Date(now + 1000) }, now)).toBe(false);
    expect(isWebAuthnChallengeUsable({ consumedAt: null, expiresAt: new Date(now - 1) }, now)).toBe(false);
  });

  it("يضبط مهلة التحدي على خمس دقائق ولا يتعامل مع مفتاح خاص", () => {
    expect(WEBAUTHN_CHALLENGE_TTL_MS).toBe(5 * 60 * 1000);
  });
});
