import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  roles: ["department_manager"] as string[],
  listRemoteAttendanceReport: vi.fn(async () => [{ profileName: "موظف عن بعد", attendanceMode: "remote", unitId: 44 }]),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getEffectiveRoles: vi.fn(async () => mocks.roles),
    getActiveCourtRoleAssignments: vi.fn(async () => [{ role: "department_manager", unitId: 44 }]),
    listRemoteAttendanceReport: mocks.listRemoteAttendanceReport,
  };
});

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 7, role: "user", email: "manager@court.example", name: "مدير", openId: "manager" } } as never);

describe("court.attendance.remoteReport", () => {
  it("يحصر تقرير حضور العاملين عن بعد في وحدة المدير", async () => {
    mocks.roles = ["department_manager"];
    await expect(caller().attendance.remoteReport()).resolves.toEqual([{ profileName: "موظف عن بعد", attendanceMode: "remote", unitId: 44 }]);
    expect(mocks.listRemoteAttendanceReport).toHaveBeenCalledWith({ startAt: undefined, endAt: undefined, unitIds: [44] });
  });

  it("يرفض اختيار وحدة خارج نطاق المدير", async () => {
    await expect(caller().attendance.remoteReport({ unitId: 55 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

void describe;
void it;
void vi;
void caller;
