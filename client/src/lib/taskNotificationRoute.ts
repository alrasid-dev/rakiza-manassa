export function taskIdFromNotificationDedupeKey(dedupeKey?: string | null) {
  const match = (dedupeKey ?? "").match(/^(?:direct-task-assigned|task-copy)-(\d+)(?:-\d+)?$/);
  const taskId = Number(match?.[1]);
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null;
}
