import { describe, expect, it } from "vitest";
import { getWebPushPublicKey, sendPushForNotification } from "./push-service";

describe("Web Push delivery", () => {
  it("exposes the configured public VAPID key", () => {
    expect(getWebPushPublicKey()).toMatch(/^[A-Za-z0-9_-]{80,}$/);
  });

  it("skips delivery when the notification has no profile recipient", async () => {
    await expect(sendPushForNotification(null, { title: "اختبار", body: "لا يرسل" })).resolves.toEqual({ sent: 0, removed: 0, skipped: true });
  });
});
