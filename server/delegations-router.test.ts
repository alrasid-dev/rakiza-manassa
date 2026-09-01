import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listProfileDelegations: vi.fn(async () => []),
  createProfileDelegation: vi.fn(async () => 41),
  updateProfileDelegationStatus: vi.fn(async () => ({ success: true })),
  getProfileById: vi.fn(async () => ({ id: 10, fullName: "موظف إداري", personType: "administrative", unitId: 1 })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    listProfileDelegations: mocks.listProfileDelegations,
    createProfileDelegation: mocks.createProfileDelegation,
    updateProfileDelegationStatus: mocks.updateProfileDelegationStatus,
    getProfileById: mocks.getProfileById,
    getAccessPermission: vi.fn(async (email: string | null) => email === "rakizaplatform@gmail.com" ? "full_control" : "employee"),
    getEffectiveRoles: vi.fn(async () => []),
    getActiveCourtRoleAssignments: vi.fn(async () => []),
    getProfileForUser: vi.fn(async () => ({ id: 9, fullName: "المالك", personType: "administrative", unitId: 1 })),
  };
});

import { courtRouter } from "./routers/court";

const owner = { id: 7, role: "user", email: "rakizaplatform@gmail.com", name: "المالك", openId: "owner" };
const ordinary = { id: 8, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" };

const delegationInput = { delegateProfileId: 10, coveredProfileId: 11, unitId: 1, assignmentType: "acting" as const, title: "تكليف بإدارة الوحدة", startsAt: new Date("2026-08-19T07:00:00Z"), endsAt: new Date("2026-08-30T15:00:00Z"), notes: "قرار تكليف" };

describe("court.people delegations", () => {
  it("يسمح للمالك بعرض وإنشاء وتحديث التكليف", async () => {
    const caller = courtRouter.createCaller({ user: owner } as never);
    await caller.people.delegations();
    await caller.people.createDelegation(delegationInput);
    await caller.people.updateDelegationStatus({ delegationId: 41, status: "ended" });
    expect(mocks.listProfileDelegations).toHaveBeenCalled();
    expect(mocks.createProfileDelegation).toHaveBeenCalledWith(expect.objectContaining({ delegateProfileId: 10, coveredProfileId: 11, createdByUserId: 7 }));
    expect(mocks.updateProfileDelegationStatus).toHaveBeenCalledWith({ delegationId: 41, status: "ended", actorUserId: 7 });
  });

  it("يرفض تكليف رئاسة المحكمة لموظف إداري", async () => {
    const caller = courtRouter.createCaller({ user: owner } as never);
    await expect(caller.people.createDelegation({ ...delegationInput, target: "court_presidency" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createProfileDelegation).not.toHaveBeenCalledWith(expect.objectContaining({ target: "court_presidency" }));
  });

  it("يحجب مستخدم التحكم العادي عن إدارة التكليف", async () => {
    const caller = courtRouter.createCaller({ user: ordinary } as never);
    await expect(caller.people.delegations()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
