// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/trpc", () => ({
  trpc: { court: { leadershipWorkloadObservatory: { useQuery: () => ({
    data: {
      generatedAt: new Date("2030-01-10T08:00:00.000Z"),
      totals: { activeStaff: 6, openTasks: 11, overdueTasks: 3, dueSoonTasks: 4, highPressureUnits: 1 },
      units: [{ unitId: 1, unitName: "قسم الدعاوى", activeStaffCount: 2, openTasks: 8, overdueTasks: 3, dueSoonTasks: 2, highPriorityTasks: 3, unassignedTasks: 1, weightedLoad: 20, pressureScore: 100, pressureLevel: "high" }],
      staff: [],
      recommendations: [{ profileId: 7, profileName: "موظف متاح", sourceUnitId: 2, sourceUnitName: "قسم الوثائق", targetUnitId: 1, targetUnitName: "قسم الدعاوى", reason: "ضغط 100/100: 8 مهمة مفتوحة، منها 3 متأخرة.", requiresHumanApproval: true, action: "review_only" }],
    }, isLoading: false, isFetching: false, error: null, refetch: vi.fn(),
  }) } } },
}));

import LeadershipWorkloadPage from "./LeadershipWorkloadPage";

afterEach(cleanup);

describe("واجهة مرصد ضغط العمل", () => {
  it("تعرض مؤشرات القسم والتوصية بشرط الاعتماد البشري دون زر نقل أو إسناد تلقائي", () => {
    render(<LeadershipWorkloadPage />);
    expect(screen.getByRole("heading", { name: "مرصد ضغط العمل" })).toBeTruthy();
    expect(screen.getAllByText("قسم الدعاوى").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ضغط مرتفع").length).toBeGreaterThan(0);
    expect(screen.getByText("مراجعة تكليف موظف متاح")).toBeTruthy();
    expect(screen.getByText("يتطلب اعتماداً بشرياً · لا تنفيذ تلقائي")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /نقل|إسناد/ })).toBeNull();
  });
});
