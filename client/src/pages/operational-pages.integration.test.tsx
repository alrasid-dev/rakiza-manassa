// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutation = { isPending: false, error: null, mutate: vi.fn() };
const query = <T,>(data: T) => ({ data, isLoading: false, error: null });

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <main data-testid="authenticated-layout">{children}</main>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ court: { people: { list: { invalidate: vi.fn() }, delegations: { invalidate: vi.fn() } }, trainees: { overview: { invalidate: vi.fn() } } } }),
    court: {
      people: {
        list: { useQuery: () => query([{ id: 10, fullName: "موظف اختباري", personType: "administrative", status: "active", jobTitle: "موظف إداري", judicialFormation: null, unitId: 1 }]) },
        create: { useMutation: () => mutation },
        delegations: { useQuery: () => query([]) },
        createDelegation: { useMutation: () => mutation },
        updateDelegationStatus: { useMutation: () => mutation },
      },
      registration: { myPermission: { useQuery: () => query("full_control") } },
      trainees: {
        overview: { useQuery: () => query([{ profile: { id: 22, fullName: "ملازم اختباري", judicialFormation: "الدائرة الأولى" }, transferState: "ready", points: 8, openDelayCount: 0, incompleteTaskCount: 0, transferReasons: [] }]) },
        templates: { useQuery: () => query([{ id: 31, title: "مراجعة سجل الملازمين", frequency: "daily", dueHourLocal: 13 }]) },
        setDuration: { useMutation: () => mutation },
        renew: { useMutation: () => mutation },
      },
      units: { list: { useQuery: () => query([{ id: 1, name: "شؤون الملازمين" }]) } },
      reports: { operational: { useQuery: () => query({ period: "daily", tasks: { total: 2, completed: 1, overdue: 0 }, delays: { total: 0, open: 0, overdue: 0 }, scores: { positive: 2, negative: 0 }, transfers: { ready: 1, notReady: 0 } }) } },
      scoring: { list: { useQuery: () => query([]) } },
    },
  },
}));

import { PeoplePage, TraineeManagementPage } from "./FunctionalPages";
import ReportsWorkspaceContent from "./ReportsWorkspaceContent";

afterEach(() => cleanup());

describe("الصفحات التشغيلية بعد تسجيل الدخول", () => {
  it("تعرض صفحة الأفراد بياناتها ولا تظهر حالة تحميل أو خطأ", () => {
    render(<PeoplePage />);
    expect(screen.getByTestId("authenticated-layout")).toBeTruthy();
    expect(screen.getByText("موظف اختباري")).toBeTruthy();
    expect(screen.queryByText(/جارٍ تحميل السجلات/)).toBeNull();
    expect(screen.queryByText(/تعذر/)).toBeNull();
  });

  it("تعرض صفحة الملازمين بيانات الدورة دون حالة خطأ", () => {
    render(<TraineeManagementPage />);
    expect(screen.getByText("ملازم اختباري")).toBeTruthy();
    expect(screen.getByText("جاهز للنقل")).toBeTruthy();
    expect(screen.getByText("قوالب مهام شؤون الملازمين")).toBeTruthy();
    expect(screen.getByText("مراجعة سجل الملازمين")).toBeTruthy();
    expect(screen.queryByText(/جارٍ تحميل ملفات الملازمين/)).toBeNull();
  });

  it("تعرض صفحة التقارير مؤشرات التقرير بعد اكتمال الاستعلام", () => {
    render(<ReportsWorkspaceContent />);
    expect(screen.getByText("التقارير المنفصلة")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("الرسم البياني للترتيب")).toBeTruthy();
    expect(screen.getByText("مقارنة مؤشرات الإنجاز")).toBeTruthy();
    expect(screen.queryByText(/جارٍ احتساب التقرير/)).toBeNull();
  });
});
