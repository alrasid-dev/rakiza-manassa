import { describe, expect, it, vi } from "vitest";

const authenticateRequest = vi.hoisted(() => vi.fn(async () => { throw new Error("تفاصيل داخلية لا يجب كشفها"); }));
vi.mock("../_core/sdk", () => ({ sdk: { authenticateRequest } }));

import { createTaskAutomationHandler } from "./task-automation";
import { handleTraineeDueSoonSchedule } from "./trainee-due-soon";

describe("معالج الجدولة المحمي", () => {
  it("لا يعيد رسالة الخطأ أو مكدس التنفيذ إلى الاستجابة العامة", async () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const handler = createTaskAutomationHandler("daily_task_reminder");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await handler({ originalUrl: "/api/scheduled/daily-task-reminder" } as never, { status } as never);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "task-automation-failed", timestamp: expect.any(String) }));
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain("تفاصيل داخلية");
    errorSpy.mockRestore();
  });

  it("يطبق الحجب نفسه على تنبيه انتهاء الملازمة", async () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await handleTraineeDueSoonSchedule({ originalUrl: "/api/scheduled/trainee-due-soon" } as never, { status } as never);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "trainee-due-soon-failed", timestamp: expect.any(String) }));
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain("تفاصيل داخلية");
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain("stack");
    errorSpy.mockRestore();
  });
});
