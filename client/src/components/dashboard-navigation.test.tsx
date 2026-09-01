import { describe, expect, it } from "vitest";
import { isNavigationSectionAllowed, navigationBadgeForItem, navigationSections, oliveIconMotionClass, resolveNavigationPermission } from "./DashboardLayout";

describe("navigation sections", () => {
  it("يستخدم فئة حركة مقيدة للأيقونات الزيتية دون تغيير تعريفات التنقل", () => {
    expect(oliveIconMotionClass).toBe("rakiza-olive-icon");
  });

  it("keeps trainee affairs tools under one section", () => {
    const traineeSections = navigationSections.filter(section => section.items.some(item => item.path === "/trainees"));
    expect(traineeSections).toHaveLength(1);
    expect(traineeSections[0]?.heading).toBe("شؤون الملازمين");
    expect(traineeSections[0]?.items.map(item => item.path)).toEqual([
      "/trainees",
      "/imports",
      "/trainee-correspondence-templates",
    ]);
  });

  it("keeps full control above leadership scope so owner-only navigation remains visible", () => {
    expect(resolveNavigationPermission("full_control", true)).toBe("full_control");
    expect(resolveNavigationPermission("general_view", true)).toBe("general_view");
    expect(resolveNavigationPermission("employee", true)).toBe("general_view");
  });

  it("isolates a court-delivery employee from unrelated navigation sections", () => {
    expect(isNavigationSectionAllowed("رئاسة المحكمة", "employee", "تسليم الأحكام", "judgments_delivery")).toBe(false);
    expect(isNavigationSectionAllowed("شؤون الملازمين", "employee", "تسليم الأحكام", "judgments_delivery")).toBe(false);
    expect(isNavigationSectionAllowed("شؤون الملازمين", "employee", "شؤون الملازمين", "trainee_affairs")).toBe(true);
    expect(isNavigationSectionAllowed("لوحة القيادة", "employee", "تسليم الأحكام", "judgments_delivery")).toBe(true);
  });

  it("exposes owner access management and human resources without duplicate registration navigation", () => {
    const paths = navigationSections.flatMap(section => section.items.map(item => item.path));
    expect(paths).not.toContain("/register");
    expect(paths).toContain("/access-management");
    expect(navigationSections.some(section => section.heading === "الموارد البشرية")).toBe(true);
    expect(navigationSections.some(section => section.heading === "رئاسة المحكمة" && section.items.some(item => item.label === "مكتب رئيس المحكمة"))).toBe(true);
    expect(navigationSections.some(section => section.items.some(item => item.label === "أمانة المحكمة"))).toBe(true);
    expect(paths.filter(path => path === "/trainees")).toHaveLength(1);
    expect(paths.filter(path => path === "/trainee-correspondence-templates")).toHaveLength(1);
  });

  it("يعرض شارات المهام والاعتمادات كعدادات موجزة لا تكشف محتوى الحدث", () => {
    expect(navigationBadgeForItem("مهامي", { mail: 1, chat: 2, taskAttention: 4, pendingApprovals: 3 })).toEqual({ count: 4, accessibleLabel: "4 مهام تتطلب متابعة" });
    expect(navigationBadgeForItem("طلبات الاعتماد", { mail: 1, chat: 2, taskAttention: 4, pendingApprovals: 3 })).toEqual({ count: 3, accessibleLabel: "3 طلبات اعتماد معلقة" });
    expect(navigationSections.flatMap(section => section.items).find(item => item.label === "طلبات الاعتماد")).toMatchObject({ path: "/approvals", operationsOnly: true });
  });
});
