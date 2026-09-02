import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("إشعار Web Push", () => {
  it("يستخدم أيقونة رَكيزة ويعرض إجراءات سريعة آمنة", () => {
    const serviceWorker = readFileSync(join(process.cwd(), "client/public/sw.js"), "utf8");
    expect(serviceWorker).toContain("icons/pwa-192.png");
    expect(serviceWorker).toContain('action: "open-tasks"');
    expect(serviceWorker).toContain('action: "open-notifications"');
    expect(serviceWorker).toContain('event.action === "open-tasks"');
    expect(serviceWorker).toContain('event.action === "open-notifications"');
  });
});

export {};
