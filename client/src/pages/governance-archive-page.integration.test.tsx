// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    court: {
      archive: { governance: { useQuery: () => ({ data: [{ approval: { id: 31, entityType: "disciplinary_action", entityId: 18, status: "approved", currentRole: "court_president", requestNote: "إحالة للمساءلة", decisionNote: "اعتمد الإجراء", decidedAt: new Date("2026-08-14T06:00:00Z") }, requesterName: "فهد", deciderName: "الرئيس", relatedNotes: [{ id: "decision-31", source: "تعليق القرار", note: "تعليق محفوظ", createdAt: new Date("2026-08-14T05:00:00Z"), actorName: "مدير" }] }], isLoading: false, error: null }) } },
      tasks: { archived: { useQuery: () => ({ data: { tasks: [], delays: [] }, isLoading: false, error: null, refetch: vi.fn() }) }, restoreArchived: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) }, archiveOperational: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) } },
    },
  },
}));

import { GovernanceArchivePage } from "./GovernanceArchivePage";

afterEach(() => cleanup());

describe("واجهة أرشيف الحوكمة", () => {
  it("تعرض القرار المنتهي وتعليقات المهمة المؤرشفة", () => {
    render(<GovernanceArchivePage />);
    expect(screen.getByText("مساءلة رقم 18")).toBeTruthy();
    expect(screen.getByText("إحالة للمساءلة")).toBeTruthy();
    expect(screen.getByText("اعتمد الإجراء")).toBeTruthy();
    expect(screen.getByText("تعليق محفوظ")).toBeTruthy();
    expect(screen.getByText("الأرشيف التشغيلي المؤقت")).toBeTruthy();
  });
});
