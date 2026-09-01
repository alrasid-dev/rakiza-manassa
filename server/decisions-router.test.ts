import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPublishedDecisionsCirculars: vi.fn(async (unitId?: number | null) => unitId ? [{ id: 2, unitId, status: "published" }] : [{ id: 1, unitId: null, status: "published" }]),
  createDecisionCircular: vi.fn(async () => 7),
  publishDecisionCircular: vi.fn(async () => undefined),
  markDecisionCircularRead: vi.fn(async () => ({ success: true })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getProfileForUser: vi.fn(async () => ({ id: 9, unitId: 44, personType: "administrative" })),
    listPublishedDecisionsCirculars: mocks.listPublishedDecisionsCirculars,
    createDecisionCircular: mocks.createDecisionCircular,
    publishDecisionCircular: mocks.publishDecisionCircular,
    markDecisionCircularRead: mocks.markDecisionCircularRead,
  };
});

import { courtRouter } from "./routers/court";

describe("court.decisions", () => {
  it("يحصر قراءة المنشورات في وحدة الموظف", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(caller.decisions.list()).resolves.toEqual([{ id: 2, unitId: 44, status: "published" }]);
    expect(mocks.listPublishedDecisionsCirculars).toHaveBeenCalledWith(44);
  });

  it("يحصر الإنشاء والنشر بمالك المنصة ويسجل القراءة للمستخدم الحالي", async () => {
    const caller = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "مالك", openId: "owner" } } as never);
    await expect(caller.decisions.create({ kind: "circular", title: "تعميم اختباري", body: "محتوى التعميم" })).resolves.toEqual({ id: 7 });
    await expect(caller.decisions.publish({ id: 7 })).resolves.toEqual({ success: true });
    await expect(caller.decisions.markRead({ decisionId: 7 })).resolves.toEqual({ success: true });
    expect(mocks.createDecisionCircular).toHaveBeenCalledWith({ kind: "circular", title: "تعميم اختباري", body: "محتوى التعميم", actorUserId: 1 });
    expect(mocks.publishDecisionCircular).toHaveBeenCalledWith({ id: 7, actorUserId: 1 });
    expect(mocks.markDecisionCircularRead).toHaveBeenCalledWith({ decisionId: 7, userId: 1 });
  });
});
