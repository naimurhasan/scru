const HIGHEST_TASK_PRIORITY = 10;

export const toQueuePriority = (taskPriority: number): number =>
  HIGHEST_TASK_PRIORITY + 1 - taskPriority;
