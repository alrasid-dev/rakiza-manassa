export const POINTS = {
  approvedTaskCompletion: 5,
  newOpenDelay: -3,
  earlyTaskStart: 1,
} as const;

export function taskApprovalScore() {
  return POINTS.approvedTaskCompletion;
}

export function newDelayScore() {
  return POINTS.newOpenDelay;
}

export function automaticUnstartedTaskScore() {
  return newDelayScore();
}

export function earlyTaskStartScore() {
  return POINTS.earlyTaskStart;
}
