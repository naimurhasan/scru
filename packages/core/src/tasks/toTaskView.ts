import type { TaskRecord, TaskView } from "./types.ts";

const toIso = (date: Date | null): string | null => date?.toISOString() ?? null;

export const toTaskView = (task: TaskRecord): TaskView => ({
  id: task.id,
  taskType: task.taskType,
  status: task.status,
  payload: task.payload,
  result: task.result ?? null,
  error:
    task.errorCode === null
      ? null
      : { code: task.errorCode, message: task.errorMessage ?? "" },
  creditsCharged: task.creditsCharged,
  createdAt: task.createdAt.toISOString(),
  startedAt: toIso(task.startedAt),
  completedAt: toIso(task.completedAt),
});
