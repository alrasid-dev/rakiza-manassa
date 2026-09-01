export type CorrespondencePermission = "full_control" | "general_view" | "employee" | "trainee" | null | undefined;

export function correspondenceRoleCapabilities(permission: CorrespondencePermission, roles: string[] | undefined) {
  const isTrainee = permission === "trainee";
  const isEmployee = permission === "employee";
  const canCreate = permission === "full_control" || isEmployee || isTrainee;
  const canChooseRouting = permission === "full_control" || roles?.some(role => role === "court_president" || role === "assistant_president" || role === "court_secretary" || role === "department_manager" || role === "trainee_affairs_manager") || false;
  const canRoute = permission === "full_control" || roles?.some(role => role === "court_president" || role === "assistant_president" || role === "court_secretary" || role === "department_manager" || role === "trainee_affairs_manager") || false;
  return { isTrainee, isEmployee, canCreate, canChooseRouting, canRoute };
}
