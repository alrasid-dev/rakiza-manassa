// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutation = vi.fn();
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({ trpc: {
  useUtils: () => ({ court: { reports: { evaluationQueue: { invalidate: vi.fn() } }, dashboard: { invalidate: vi.fn() } } }),
  court: { reports: {
    evaluationQueue: { useQuery: () => ({ isLoading: false, error: null, data: [{ document: { id: 71, title: "تقرير أسبوعي", reportPeriod: "weekly" }, evaluation: { id: 81, managerDecision: "pending", analysisStatus: "readable", analysisSummary: "تقرير واضح مع إنجازات موثقة.", extractedCompletedCount: 25, extractedIssueCount: 1, periodDays: 5, normalizedDailyRateHundredths: 500, confidence: 90, suggestedPoints: 4 }, profileName: "محمد", unitName: "قسم الدعاوى", findings: ["يلزم إرفاق مرجع مهمة واحد."] }] }) },
    reviewEvaluation: { useMutation: () => ({ mutate: mutation, isPending: false }) },
  } },
} }));

import PerformanceReportEvaluationsPage from "./PerformanceReportEvaluationsPage";

afterEach(() => { cleanup(); mutation.mockReset(); });

describe("واجهة اعتماد تقييم تقارير الأداء", () => {
  it("تعرض القياس المطبّع وتجعل تثبيت النقاط قراراً يدوياً للمراجع", () => {
    render(<PerformanceReportEvaluationsPage />);
    expect(screen.getByRole("heading", { name: "تقييم تقارير الأداء" })).toBeTruthy();
    expect(screen.getByText(/إنجاز\/يوم/)).toBeTruthy();
    expect(screen.getByText("اقتراح النظام: 4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "اعتماد وتثبيت النقاط" }));
    expect(mutation).toHaveBeenCalledWith(expect.objectContaining({ documentId: 71, decision: "accepted", managerPoints: 4 }));
  });
});
