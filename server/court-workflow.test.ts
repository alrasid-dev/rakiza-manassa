import { describe, expect, it } from "vitest";
import { canActOnApproval, canActOnManagerAssignmentApproval, canManageOperations, managerAssignmentApprovalSequence, nextApprovalRole, nextManagerAssignmentApprovalRole } from "./court-workflow";

describe("مسار الاعتماد الإداري", () => {
  it("ينقل الطلب بالترتيب من مدير شؤون الملازمين إلى الرئيس المساعد ثم رئيس المحكمة", () => {
    expect(nextApprovalRole("trainee_affairs_manager")).toBe("assistant_president");
    expect(nextApprovalRole("assistant_president")).toBe("court_president");
    expect(nextApprovalRole("court_president")).toBeNull();
  });

  it("يمر طلب تسكين مدير القسم من الموارد البشرية إلى الأمين ثم الرئيس", () => {
    expect(managerAssignmentApprovalSequence).toEqual(["human_resources_manager", "court_secretary", "court_president"]);
    expect(nextManagerAssignmentApprovalRole("human_resources_manager")).toBe("court_secretary");
    expect(nextManagerAssignmentApprovalRole("court_secretary")).toBe("court_president");
    expect(nextManagerAssignmentApprovalRole("court_president")).toBeNull();
    expect(canActOnManagerAssignmentApproval("human_resources_manager", "human_resources_manager")).toBe(true);
    expect(canActOnManagerAssignmentApproval("court_secretary", "human_resources_manager")).toBe(false);
    expect(canActOnManagerAssignmentApproval("court_president", "court_secretary")).toBe(true);
  });

  it("لا يمنح الموظف الإداري صلاحية إدارة العمليات أو اعتماد طلب مرفوع", () => {
    expect(canManageOperations(["administrative_staff"])).toBe(false);
    expect(canManageOperations(["court_secretary"])).toBe(true);
    expect(canManageOperations(["human_resources_manager"])).toBe(true);
    expect(canActOnApproval("administrative_staff", "trainee_affairs_manager")).toBe(false);
  });

  it("يسمح لرئيس المحكمة بالمراجعة النهائية ضمن المسار", () => {
    expect(canManageOperations(["court_president"])).toBe(true);
    expect(canActOnApproval("court_president", "assistant_president")).toBe(true);
  });

  it("يحصر كل مستوى قيادي في مرحلته مع بقاء الرئيس مخولاً بالتدخل النهائي", () => {
    expect(canManageOperations(["assistant_president"])).toBe(true);
    expect(canManageOperations(["trainee_affairs_manager"])).toBe(true);
    expect(canActOnApproval("trainee_affairs_manager", "trainee_affairs_manager")).toBe(true);
    expect(canActOnApproval("trainee_affairs_manager", "assistant_president")).toBe(false);
    expect(canActOnApproval("assistant_president", "trainee_affairs_manager")).toBe(false);
  });
});
