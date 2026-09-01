import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listMeetings: vi.fn(async (unitId?: number | null) => unitId ? [{ id: 4, unitId }] : [{ id: 1, unitId: null }]), createMeeting: vi.fn(async () => 9), saveMeetingMinutes: vi.fn(async () => undefined) }));
vi.mock("./court-service", async importOriginal => ({ ...(await importOriginal<typeof import("./court-service")>()), getAccessPermission: vi.fn(async () => "employee"), getProfileForUser: vi.fn(async () => ({ id: 5, unitId: 44, personType: "administrative" })), listMeetings: mocks.listMeetings, createMeeting: mocks.createMeeting, saveMeetingMinutes: mocks.saveMeetingMinutes }));
import { courtRouter } from "./routers/court";

describe("court.meetings", () => {
  it("يعزل اجتماعات الموظف حسب وحدته", async () => {
    const caller = courtRouter.createCaller({ user: { id: 5, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);
    await expect(caller.meetings.list()).resolves.toEqual([{ id: 4, unitId: 44 }]);
    expect(mocks.listMeetings).toHaveBeenCalledWith(44);
  });
  it("ينشئ اجتماعاً ويحفظ محضره للمخول", async () => {
    const caller = courtRouter.createCaller({ user: { id: 1, role: "admin", email: "owner@court.example", name: "مالك", openId: "owner" } } as never);
    await expect(caller.meetings.create({ title: "اجتماع اختباري", scheduledAt: new Date("2026-08-20T07:00:00Z") })).resolves.toEqual({ id: 9 });
    await expect(caller.meetings.minutes({ meetingId: 9, minutes: "تمت مناقشة البنود" })).resolves.toEqual({ success: true });
  });
});
