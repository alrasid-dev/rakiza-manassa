import { describe, expect, it } from "vitest";
import webpush from "web-push";

describe("Web Push configuration", () => {
  it("accepts the configured VAPID key pair", () => {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    expect(subject).toMatch(/^mailto:/);
    expect(publicKey).toMatch(/^[A-Za-z0-9_-]{80,}$/);
    expect(privateKey).toMatch(/^[A-Za-z0-9_-]{40,}$/);

    const decodeBase64Url = (value: string) => Buffer.from(value, "base64url");
    expect(decodeBase64Url(publicKey!).byteLength).toBe(65);
    expect(decodeBase64Url(privateKey!).byteLength).toBe(32);
    expect(() => webpush.setVapidDetails(subject!, publicKey!, privateKey!)).not.toThrow();
  });
});
