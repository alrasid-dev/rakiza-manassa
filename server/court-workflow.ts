import type { CourtRole } from "../drizzle/schema";

export type ApprovalRole = "trainee_affairs_manager" | "human_resources_manager" | "court_secretary" | "assistant_president" | "court_president";
export type ManagerAssignmentApprovalRole = "human_resources_manager" | "court_secretary" | "court_president";

export const approvalSequence: ApprovalRole[] = [
  "trainee_affairs_manager",
  "assistant_president",
  "court_president",
];

export function nextApprovalRole(role: ApprovalRole): ApprovalRole | null {
  const index = approvalSequence.indexOf(role);
  if (index === -1 || index === approvalSequence.length - 1) return null;
  return approvalSequence[index + 1] ?? null;
}

export function canActOnApproval(role: CourtRole, currentRole: ApprovalRole) {
  return role === currentRole || role === "court_president";
}

export const managerAssignmentApprovalSequence: ManagerAssignmentApprovalRole[] = ["human_resources_manager", "court_secretary", "court_president"];

export function nextManagerAssignmentApprovalRole(role: ManagerAssignmentApprovalRole): ManagerAssignmentApprovalRole | null {
  const index = managerAssignmentApprovalSequence.indexOf(role);
  return index >= 0 && index < managerAssignmentApprovalSequence.length - 1 ? managerAssignmentApprovalSequence[index + 1] ?? null : null;
}

export function canActOnManagerAssignmentApproval(role: CourtRole, currentRole: ManagerAssignmentApprovalRole) {
  return role === currentRole || role === "court_president";
}

export function canManageOperations(roles: CourtRole[]) {
  return roles.some(role => ["court_president", "assistant_president", "court_secretary", "human_resources_manager", "department_manager", "performance_monitor", "trainee_affairs_manager"].includes(role));
}
