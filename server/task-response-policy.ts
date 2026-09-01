export function taskAssignmentNotification(taskId: number, title: string) {
  return {
    dedupeKey: `direct-task-assigned-${taskId}`,
    title: "تم إسناد مهمة جديدة",
    body: `تم إسناد المهمة: ${title}. افتح المهام لتأكيد المعالجة أو إضافة تعليق وإحالته للمدير.`,
  };
}

export function taskCopyNotification(taskId: number, title: string, traineeProfileId: number) {
  return {
    dedupeKey: `task-copy-${taskId}-${traineeProfileId}`,
    title: "نسخة تنبيه على مهمة تشغيلية",
    body: `تمت إضافتك نسخة تنبيه على المهمة: ${title}. لا يعني ذلك تكليفك بالمهمة، ويفتح مركز المهام تفاصيلها ضمن نطاق اطلاعك.`,
  };
}

export function taskAssignmentNotifications(input: { taskId: number; title: string; assigneeProfileId?: number; traineeCopyProfileId?: number }) {
  const notifications: Array<{ profileId: number; category: "task_due"; title: string; body: string; dedupeKey: string }> = [];
  if (input.assigneeProfileId) {
    notifications.push({ profileId: input.assigneeProfileId, category: "task_due", ...taskAssignmentNotification(input.taskId, input.title) });
  }
  if (input.traineeCopyProfileId && input.traineeCopyProfileId !== input.assigneeProfileId) {
    notifications.push({ profileId: input.traineeCopyProfileId, category: "task_due", ...taskCopyNotification(input.taskId, input.title, input.traineeCopyProfileId) });
  }
  return notifications;
}

export function completedTaskTransition() {
  return { status: "under_review" as const, updateType: "submitted" as const, note: "تمت المعالجة بانتظار مراجعة المدير" };
}
