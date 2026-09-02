import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("مسار تشغيل Vercel", () => {
  it("لا يسحب Vite أو مدخل التطوير المحلي إلى دالة النشر", () => {
    const apiEntry = readFileSync(join(process.cwd(), "api/index.ts"), "utf8");
    const serverEntry = readFileSync(join(process.cwd(), "server.ts"), "utf8");
    const appEntry = readFileSync(join(process.cwd(), "server/_core/app.ts"), "utf8");
    const staticEntry = readFileSync(join(process.cwd(), "server/_core/static.ts"), "utf8");
    for (const source of [apiEntry, serverEntry, appEntry, staticEntry]) {
      expect(source).not.toMatch(/from ["']vite["']/);
      expect(source).not.toMatch(/vite\.config/);
      expect(source).not.toMatch(/_core\/index/);
      expect(source).not.toMatch(/from ["']\.\/vite["']/);
    }
  });
});
