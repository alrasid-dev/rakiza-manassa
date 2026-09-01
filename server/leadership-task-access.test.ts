import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  roles: [] as string[],
  getAccessPermission: vi.fn(async () => "employee"),
  getEffectiveRoles: vi.fn(async () => mocks.roles),
  getTaskById: vi.fn(async () => ({ id: 44, title: "مهمة فعلية", status: "in_progress", unitId: 90014, assigneeProfileId: 10 })),
  updateTaskStatus: vi.fn(async () => ({ success: true, status: "completed" })),
}));

vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return { ...actual, getAccessPermission: mocks.getAccessPermission, getEffectiveRoles: mocks.getEffectiveRoles, getTaskById: mocks.getTaskById, updateTaskStatus: mocks.updateTaskStatus };
});

import { courtRouter } from "./routers/court";

const taskInput = { taskId: 44, status: "completed" as const, note: "تمت المراجعة القيادية" };

describe("صلاحية القيادة على عمل الموظفين", () => {
  it.each([
    ["president@moj.gov.sa", "court_president"],
    ["assistant@moj.gov.sa", "assistant_president"],
  ])("يسمح لدور %s بتعديل حالة المهمة", async email => {
    mocks.roles = email === "president@moj.gov.sa" ? ["court_president"] : ["assistant_president"];
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email, name: "قيادة", openId: email } } as never);
    await expect(caller.tasks.updateStatus(taskInput)).resolves.toEqual({ success: true, status: "completed" });
    expect(mocks.updateTaskStatus).toHaveBeenCalledWith(expect.objectContaining({ taskId: 44, actorUserId: 7 }));
  });

  it("يمنع الموظف العادي من تعديل حالة مهمة غير مسندة إليه", async () => {
    mocks.roles = [];
    const caller = courtRouter.createCaller({ user: { id: 8, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);
    await expect(caller.tasks.updateStatus(taskInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
