import { isTaskPending } from "@scru/core";

export const hasPendingTask = (tasks: Array<{ status: string }>) =>
  tasks.some(({ status }) => isTaskPending(status));
