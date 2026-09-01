// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { recurringMutate, updateMutate, setSchedules } = vi.hoisted(() => {
  let schedules: any[] = [];
  return { recurringMutate: vi.fn(), updateMutate: vi.fn(), setSchedules: (value: any[]) => { schedules = value; }, getSchedules: () => schedules };
});

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ court: { internalMail: { list: { invalidate: vi.fn() }, folderCounts: { invalidate: vi.fn() }, get: { invalidate: vi.fn() } } } }),
    court: { internalMail: {
      recurringSchedules: { useQuery: () => ({ data: (globalThis as any).__mailScheduleData ?? [], refetch: vi.fn() }) },
      schedule: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      scheduleRecurring: { useMutation: () => ({ mutate: recurringMutate, isPending: false }) },
      updateRecurringSchedule: { useMutation: () => ({ mutate: updateMutate, isPending: false }) },
    } },
  },
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import MailScheduleButton from "./MailScheduleButton";

afterEach(() => { cleanup(); recurringMutate.mockReset(); updateMutate.mockReset(); (globalThis as any).__mailScheduleData = []; });

describe("زر جدولة بريد ركيزة", () => {
  it("يرسل قاعدة تكرار أسبوعية مرنة مع وقت البداية والأيام المختارة", () => {
    render(<MailScheduleButton messageId={42} status="draft" />);
    fireEvent.click(screen.getByLabelText("فتح جدولة الإرسال"));
    fireEvent.change(screen.getByLabelText("وقت الإرسال المجدول"), { target: { value: "2030-01-10T09:30" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "تأكيد التكرار" }));
    expect(recurringMutate).toHaveBeenCalledWith(expect.objectContaining({ messageId: 42, frequency: "weekly", intervalCount: 1, weekdays: [0], monthDay: null, endsAt: null }));
    expect(recurringMutate.mock.calls[0]?.[0].startsAt.toISOString()).toBe("2030-01-10T09:30:00.000Z");
  });

  it("يعرض التحكم في الإيقاف للجدولة التي يملكها صاحب المسودة", () => {
    (globalThis as any).__mailScheduleData = [{ id: 8, sourceMessageId: 42, status: "active", frequency: "weekly", intervalCount: 1, nextRunAt: "2030-01-13T09:30:00.000Z" }];
    render(<MailScheduleButton messageId={42} status="draft" />);
    fireEvent.click(screen.getByLabelText("فتح جدولة الإرسال"));
    expect(screen.getByText("تكرار قائم: مفعلة")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "إيقاف" }));
    expect(updateMutate).toHaveBeenCalledWith({ scheduleId: 8, action: "pause" });
  });

  it("يتيح استئناف أو إلغاء الجدولة المملوكة فقط من بطاقة المسودة", () => {
    (globalThis as any).__mailScheduleData = [{ id: 9, sourceMessageId: 42, status: "paused", frequency: "daily", intervalCount: 2, nextRunAt: "2030-01-13T09:30:00.000Z" }];
    render(<MailScheduleButton messageId={42} status="draft" />);
    fireEvent.click(screen.getByLabelText("فتح جدولة الإرسال"));
    expect(screen.getByText("تكرار قائم: متوقفة")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "استئناف" }));
    fireEvent.click(screen.getByRole("button", { name: "إلغاء" }));
    expect(updateMutate).toHaveBeenNthCalledWith(1, { scheduleId: 9, action: "resume" });
    expect(updateMutate).toHaveBeenNthCalledWith(2, { scheduleId: 9, action: "cancel" });
  });
});
