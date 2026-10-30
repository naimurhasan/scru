const PENDING_STATUSES = new Set(["QUEUED", "PROCESSING"]);

export const isTaskPending = (status: string): boolean =>
  PENDING_STATUSES.has(status);
