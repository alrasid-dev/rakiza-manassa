// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ minutesCalls: [] as Record<string, unknown>[], attendanceCalls: [] as Record<string, unknown>[], taskCalls: [] as Record<string, unknown>[] }));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const meeting = { id: 7, title: "اجتماع القسم", scheduledAt: "2026-08-20T07:00:00Z", location: "قاعة 1", status: "scheduled", agenda: "بنود النقاش", minutes: null as string | null, recommendations: null as string | null };

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ court: { meetings: { list: { invalidate: vi.fn() } } } }),
    court: {
      registration: { myPermission: { useQuery: () => ({ data: "full_control", isLoading: false, error: null }) } },
      meetings: {
        list: { useQuery: () => ({ data: [meeting], isLoading: false }) },
        create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
        invite: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
        minutes: { useMutation: () => ({ mutate: (input: Record<string, unknown>) => state.minutesCalls.push(input), isPending: false }) },
        attendees: { useQuery: () => ({ data: [{ id: 55, meetingId: 7, profileId: 1, attendanceStatus: "invited" }], refetch: vi.fn() }) },
        updateAttendance: { useMutation: () => ({ mutate: (input: Record<string, unknown>) => state.attendanceCalls.push(input), isPending: false }) },
        recommendationsToTasks: { useMutation: () => ({ mutate: (input: Record<string, unknown>) => state.taskCalls.push(input), isPending: false }) },
      },
      people: { list: { useQuery: () => ({ data: [{ id: 1, fullName: "موظف مختبر" }] }) } },
    },
  },
}));

import { MeetingsPage } from "./MeetingsPage";

beforeEach(() => { state.minutesCalls.length = 0; state.attendanceCalls.length = 0; state.taskCalls.length = 0; });
afterEach(() => cleanup());

describe("صفحة الاجتماعات", () => {
  it("تتيح إدخال التوصيات وترسلها مع المحضر", () => {
    render(<MeetingsPage />);
    const minutesField = screen.getByLabelText("محضر اجتماع اجتماع القسم");
    const recommendationsField = screen.getByLabelText("توصيات اجتماع اجتماع القسم");
    expect(recommendationsField).toBeTruthy();
    fireEvent.change(minutesField, { target: { value: "تمت مناقشة البنود" } });
    fireEvent.change(recommendationsField, { target: { value: "اعتماد الخطة الشهرية" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ المحضر والتوصيات" }));
    expect(state.minutesCalls).toEqual([{ meetingId: 7, minutes: "تمت مناقشة البنود", recommendations: "اعتماد الخطة الشهرية" }]);
  });

  it("لا ترسل التوصيات عندما تكون فارغة", () => {
    render(<MeetingsPage />);
    fireEvent.change(screen.getByLabelText("محضر اجتماع اجتماع القسم"), { target: { value: "محضر بلا توصيات" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ المحضر والتوصيات" }));
    expect(state.minutesCalls).toEqual([{ meetingId: 7, minutes: "محضر بلا توصيات", recommendations: undefined }]);
  });

  it("توثّق حضور المدعوين وترسل تحديث الحالة", () => {
    render(<MeetingsPage />);
    const statusSelect = screen.getByLabelText("حالة حضور موظف مختبر");
    fireEvent.change(statusSelect, { target: { value: "attended" } });
    expect(state.attendanceCalls).toEqual([{ attendeeId: 55, attendanceStatus: "attended" }]);
  });

  it("تحوّل التوصيات إلى مهام موزعة بمواعيد الجدولة والاستحقاق", () => {
    render(<MeetingsPage />);
    fireEvent.change(screen.getByLabelText("توصيات اجتماع اجتماع القسم"), { target: { value: "بند أول\nبند ثانٍ" } });
    fireEvent.change(screen.getByLabelText("تاريخ جدولة مهام اجتماع القسم"), { target: { value: "2026-08-21T08:00" } });
    fireEvent.change(screen.getByLabelText("تاريخ استحقاق مهام اجتماع القسم"), { target: { value: "2026-08-25T14:00" } });
    fireEvent.click(screen.getByRole("button", { name: "تحويل التوصيات إلى مهام" }));
    expect(state.taskCalls).toHaveLength(1);
    expect(state.taskCalls[0]).toMatchObject({ meetingId: 7, recommendations: "بند أول\nبند ثانٍ" });
  });
});
