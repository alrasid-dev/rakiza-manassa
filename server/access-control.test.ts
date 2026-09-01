import { describe, expect, it } from "vitest";
import { canPerform, canViewWholePlatform, isSelfWorkspacePermission } from "./access-control";

describe("صلاحيات المنصة", () => {
  it("يسمح للتحكم الكامل بجميع الإجراءات", () => {
    expect(canPerform("full_control", "view")).toBe(true);
    expect(canPerform("full_control", "edit")).toBe(true);
    expect(canPerform("full_control", "manage_access")).toBe(true);
  });

  it("لا تمنح general_view رؤية شاملة خارج القيادة الصريحة", () => {
    expect(canPerform("general_view", "view")).toBe(true);
    expect(canPerform("general_view", "edit")).toBe(false);
    expect(canViewWholePlatform("general_view")).toBe(false);
    expect(canViewWholePlatform("full_control")).toBe(true);
  });

  it("يتيح للموظف والملازم تنفيذ الإجراءات المرتبطة بمساحتهما فقط دون إدارة", () => {
    expect(canPerform("employee", "view")).toBe(true);
    expect(canPerform("employee", "edit")).toBe(true);
    expect(canPerform("employee", "manage_access")).toBe(false);
    expect(canPerform("trainee", "view")).toBe(true);
    expect(canPerform("trainee", "edit")).toBe(true);
    expect(canPerform("trainee", "manage_access")).toBe(false);
    expect(isSelfWorkspacePermission("employee")).toBe(true);
    expect(isSelfWorkspacePermission("trainee")).toBe(true);
    expect(canViewWholePlatform("trainee")).toBe(false);
    expect(canPerform(null, "view")).toBe(false);
  });
});
