// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ minutesCalls: [] as Record<string, unknown>[] }));

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
      },
      people: { list: { useQuery: () => ({ data: [{ id: 1, fullName: "موظف مختبر" }] }) } },
    },
  },
}));

import { MeetingsPage } from "./MeetingsPage";

beforeEach(() => { state.minutesCalls.length = 0; });
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
});
