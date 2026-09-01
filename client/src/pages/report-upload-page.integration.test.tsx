// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ court: { dashboard: { invalidate: vi.fn() } } }), court: { myRoles: { useQuery: () => ({ data: ["performance_monitor"] }) }, units: { list: { useQuery: () => ({ data: [{ id: 10, name: "قسم مراقبة الأداء" }] }) } }, people: { list: { useQuery: () => ({ data: [{ id: 12, fullName: "موظف مختبر" }] }) } }, reports: { upload: { useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }) } } } } }));

import { ReportUploadPage } from "./ReportUploadPage";

afterEach(() => cleanup());

describe("واجهة رفع تقرير الإنجاز", () => {
  it("تعرض قبول PDF وWord وExcel وخيار تسجيل التقرير لصالح موظف عند دور مراقبة الأداء", () => {
    render(<ReportUploadPage />);
    expect(screen.getByText("رفع تقرير وإثبات إنجاز")).toBeTruthy();
    expect(screen.getByText(/PDF أو DOCX أو XLSX/)).toBeTruthy();
    expect(screen.getByLabelText("تسجيل التقرير لصالح موظف أو قسم")).toBeTruthy();
    expect(screen.getByLabelText("تحويل التقرير إلى مهام موزعة")).toBeTruthy();
    expect(screen.getByText("موظف مختبر")).toBeTruthy();
  });
});
