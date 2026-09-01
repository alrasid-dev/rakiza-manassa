import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ updateOperationalProfile: vi.fn(async () => undefined) }));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, updateOperationalProfile: mocks.updateOperationalProfile, getAccessPermission: vi.fn(async () => "employee") };
});

import { courtRouter } from "./routers/court";

describe("تعديل الملفات التشغيلية", () => {
  it("يسمح لمالك التحكم الكامل بتعديل ملف موظف أو ملازم ويسجل منفذ العملية", async () => {
    const owner = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "المالك", openId: "owner" } } as never);
    await expect(owner.people.update({ profileId: 17, fullName: "ملازم مختبر", jobTitle: "ملازم قضائي", judicialFormation: "الدائرة الثانية", attendanceMode: "in_person", status: "active" })).resolves.toEqual({ success: true });
    expect(mocks.updateOperationalProfile).toHaveBeenCalledWith(expect.objectContaining({ profileId: 17, fullName: "ملازم مختبر", actorUserId: 1 }));
  });

  it("يحجب مسار تعديل الملفات التشغيلية عن الموظف العادي", async () => {
    const employee = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(employee.people.update({ profileId: 17, fullName: "تعديل غير مصرح", status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
