import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  profile: { id: 12, fullName: "ملازم مختبر", personType: "trainee" },
  listScoreEventsForProfile: vi.fn(async () => [{ event: { id: 1, points: 7, reason: "معالجة مهمة", createdAt: new Date("2026-08-14T06:00:00Z") }, createdByName: "النظام" }, { event: { id: 2, points: -2, reason: "تأخر", createdAt: new Date("2026-08-13T06:00:00Z") }, createdByName: "مدير" }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getAccessPermission: vi.fn(async () => "trainee"), getProfileForUser: vi.fn(async () => mocks.profile), listScoreEventsForProfile: mocks.listScoreEventsForProfile };
});

import { courtRouter } from "./routers/court";

describe("سجل الإنجازات الذاتي", () => {
  it("يستخدم ملف الجلسة دون قبول أي معرف ملف من العميل ويعيد رصيد نقاطه وتقييمه", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "trainee@court.example", name: "ملازم", openId: "trainee" } } as never);
    await expect(caller.achievements.mine()).resolves.toMatchObject({ profile: { id: 12, fullName: "ملازم مختبر" }, summary: { positive: 7, negative: 2, balance: 5 }, performance: { tier: "steady", label: "أداء مستقر" } });
    expect(mocks.listScoreEventsForProfile).toHaveBeenCalledWith(12);
  });

  it("يرفض عرض السجل عندما لا يرتبط الحساب بملف شخصي", async () => {
    mocks.profile = null as never;
    const caller = courtRouter.createCaller({ user: { id: 8, role: "user", email: "no-profile@court.example", name: "مستخدم", openId: "no-profile" } } as never);
    await expect(caller.achievements.mine()).rejects.toMatchObject({ code: "FORBIDDEN" });
    mocks.profile = { id: 12, fullName: "ملازم مختبر", personType: "trainee" };
  });
});
