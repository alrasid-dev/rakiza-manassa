import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  managedUnitId: 90023,
  getEvaluation: vi.fn(async () => ({ document: { id: 71, unitId: 90023, profileId: 9 }, evaluation: { id: 81, managerDecision: "pending", analysisStatus: "readable" } })),
  review: vi.fn(async () => ({ documentId: 71, decision: "accepted", managerPoints: 4, appliedScore: 4 })),
}));

vi.mock("../db", () => ({ getDb: vi.fn(async () => null) }));
vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getAccessPermission: vi.fn(async () => "employee"), getEffectiveRoles: vi.fn(async () => []), getActiveCourtRoleAssignments: vi.fn(async () => [{ role: "department_manager", unitId: mocks.managedUnitId }]), getPerformanceReportEvaluation: mocks.getEvaluation, reviewPerformanceReportEvaluation: mocks.review };
});

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 7, role: "user", email: "manager@court.example", name: "مدير القسم", openId: "manager" } } as never);

describe("اعتماد تقييم تقرير الأداء", () => {
  it("يسمح لمدير القسم باعتماد تقرير ضمن وحدته ويكتب قيمة النقاط التي اعتمدها", async () => {
    mocks.managedUnitId = 90023;
    await expect(caller().reports.reviewEvaluation({ documentId: 71, decision: "accepted", managerPoints: 4, managerNote: "اعتماد بعد مراجعة المرفق." })).resolves.toMatchObject({ appliedScore: 4 });
    expect(mocks.review).toHaveBeenCalledWith(expect.objectContaining({ documentId: 71, managerPoints: 4, reviewerUserId: 7 }));
  });

  it("يرفض اعتماد تقرير خارج وحدة مدير القسم", async () => {
    mocks.managedUnitId = 90024;
    await expect(caller().reports.reviewEvaluation({ documentId: 71, decision: "accepted", managerPoints: 4 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
