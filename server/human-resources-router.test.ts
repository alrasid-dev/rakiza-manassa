import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listProfiles: vi.fn(async (personType?: string) => [{ id: 11, fullName: "موظف إداري", personType: personType ?? "administrative" }]),
  createProfile: vi.fn(async () => 11),
  getEffectiveRoles: vi.fn(async (userId: number) => userId === 7 ? ["human_resources_manager"] : []),
  getAccessPermission: vi.fn(async () => "employee"),
  getProfileForUser: vi.fn(async () => ({ id: 8, fullName: "موظف", personType: "administrative", attendanceMode: "remote", unitId: 1 })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, listProfiles: mocks.listProfiles, createProfile: mocks.createProfile, getEffectiveRoles: mocks.getEffectiveRoles, getAccessPermission: mocks.getAccessPermission, getProfileForUser: mocks.getProfileForUser };
});

import { courtRouter } from "./routers/court";

const hrCaller = () => courtRouter.createCaller({ user: { id: 7, role: "user", email: "hr@moj.gov.sa", name: "الموارد البشرية", openId: "hr" } } as never);

const employeeInput = { personType: "administrative" as const, fullName: "موظف جديد", email: "new@moj.gov.sa", status: "active" as const, reason: "إضافة موظف معتمد بقرار مباشرة" };

describe("صلاحيات الموارد البشرية", () => {
  it("تحصر عرض الموارد البشرية على الملفات الإدارية", async () => {
    await expect(hrCaller().people.list({ personType: "administrative" })).resolves.toEqual([{ id: 11, fullName: "موظف إداري", personType: "administrative" }]);
    expect(mocks.listProfiles).toHaveBeenCalledWith("administrative");
  });

  it("تشترط سبباً قبل إضافة دخول موظف", async () => {
    await expect(hrCaller().people.create({ ...employeeInput, reason: undefined })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(hrCaller().people.create(employeeInput)).resolves.toEqual({ id: 11 });
    expect(mocks.createProfile).toHaveBeenCalledWith(expect.objectContaining({ reason: "إضافة موظف معتمد بقرار مباشرة", actorUserId: 7 }));
  });
});
