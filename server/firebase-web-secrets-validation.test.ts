import { describe, expect, it } from "vitest";

describe("Firebase Web configuration", () => {
  it("accepts the configured public API key without creating data", async () => {
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    expect(apiKey).toBeTruthy();
    expect(projectId).toBeTruthy();
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey!)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "rakiza-config-validation@example.invalid", password: "not-a-real-password", returnSecureToken: true }),
    });
    const body = await response.text();
    expect(body).not.toMatch(/API_KEY_INVALID|invalid api key/i);
    expect([400, 403]).toContain(response.status);
  }, 15000);
});
