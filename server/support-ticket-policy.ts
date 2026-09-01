export type SupportTicketStage = "agent" | "manager" | "president";

export function supportTicketDeadlines(createdAt: Date) {
  const agentDueAt = new Date(createdAt.getTime() + 72 * 60 * 60 * 1000);
  const managerDueAt = new Date(agentDueAt.getTime() + 24 * 60 * 60 * 1000);
  return { agentDueAt, managerDueAt };
}

export function leastLoadedSupportProfile<T extends { id: number }>(candidates: Array<{ profile: T; openTicketCount: number }>) {
  return [...candidates].sort((left, right) => left.openTicketCount - right.openTicketCount || left.profile.id - right.profile.id)[0]?.profile;
}

export function supportTicketStageAt(ticket: { status: string; dueAt: Date; managerDueAt: Date | null }, now: Date): SupportTicketStage | undefined {
  if (["resolved", "closed", "escalated_to_president"].includes(ticket.status)) return undefined;
  if (ticket.status === "escalated_to_manager" && ticket.managerDueAt && ticket.managerDueAt <= now) return "president";
  if (["open", "in_progress"].includes(ticket.status) && ticket.dueAt <= now) return "manager";
  return undefined;
}
