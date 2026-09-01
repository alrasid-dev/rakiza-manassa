import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTaskExceptionRequest: vi.fn(async () => ({ id: 71, managerProfileId: 4 })),
  decideTaskExceptionRequest: vi.fn(async () => ({ success: true, requestId: 71, reassigneeName: "موظف بديل", deductionPoints: -3 })),
  listTaskExceptionRequestsForManager: vi.fn(async () => []),
  getProfileForUser: vi.fn(async () => ({ id: 4, userId: 9, fullName: "مدير القسم", personType: "administrative", unitId: 2, status: "active" })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    createTaskExceptionRequest: mocks.createTaskExceptionRequest,
    decideTaskExceptionRequest: mocks.decideTaskExceptionRequest,
    listTaskExceptionRequestsForManager: mocks.listTaskExceptionRequestsForManager,
    getProfileForUser: mocks.getProfileForUser,
  };
});

import { courtRouter } from "./routers/court";

describe("court.tasks.exceptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProfileForUser.mockResolvedValue({ id: 4, userId: 9, fullName: "مدير القسم", personType: "administrative", unitId: 2, status: "active" });
  });

  it("يربط طلب إعادة الإسناد بملف مقدم الطلب وبالمستخدم المنفذ", async () => {
    const caller = courtRouter.createCaller({ user: { id: 9, role: "admin", email: "owner@court.example", name: "مالك", openId: "owner" } } as never);

    await caller.tasks.exceptions.request({ taskId: 44, kind: "reassignment", reason: "تعذر البدء بسبب تعارض عمل عاجل" });

    expect(mocks.createTaskExceptionRequest).toHaveBeenCalledWith({ taskId: 44, kind: "reassignment", reason: "تعذر البدء بسبب تعارض عمل عاجل", requesterProfileId: 4, actorUserId: 9 });
  });

  it("يمرر قرار المدير وإعادة الإسناد إلى الخدمة، بينما يطبق الخصم تلقائياً في الخادم", async () => {
    const caller = courtRouter.createCaller({ user: { id: 9, role: "admin", email: "owner@court.example", name: "مالك", openId: "owner" } } as never);

    await caller.tasks.exceptions.decide({ requestId: 71, decision: "approved", managerNote: "اعتمدت الإعادة مع توثيق سبب التأخر.", reassigneeProfileId: 22 });

    expect(mocks.decideTaskExceptionRequest).toHaveBeenCalledWith({ requestId: 71, decision: "approved", managerNote: "اعتمدت الإعادة مع توثيق سبب التأخر.", reassigneeProfileId: 22, managerProfileId: 4, actorUserId: 9 });
  });
});
