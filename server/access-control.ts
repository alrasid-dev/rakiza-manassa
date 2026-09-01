export type AppPermission = "full_control" | "general_view" | "employee" | "trainee" | null;
export type ProtectedAction = "view" | "edit" | "manage_access";

/**
 * تحدد هذه الدالة مستوى الإمكانية فقط؛ أما عزل السجل الذاتي للموظف والملازم
 * فيُفرض في المسار التشغيلي بعد معرفة رقم ملفه الشخصي.
 */
export function canPerform(permission: AppPermission, action: ProtectedAction) {
  if (!permission) return false;
  if (permission === "full_control") return true;
  if (permission === "general_view") return action === "view";
  if (permission === "employee" || permission === "trainee") return action === "view" || action === "edit";
  return false;
}

export function canViewWholePlatform(permission: AppPermission) {
  // الرؤية الشاملة لا تأتي من منحة عامة؛ القيادة تُحسم من أدوارها الصريحة في الخادم.
  return permission === "full_control";
}

export function isSelfWorkspacePermission(permission: AppPermission) {
  return permission === "employee" || permission === "trainee";
}
