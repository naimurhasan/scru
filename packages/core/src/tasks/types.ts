export const TASK_STATUSES = [
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TYPES = ["GOOGLE", "CRAWL", "EXTRACTOR", "BATCH"] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export type TaskRecord = {
  id: string;
  taskType: string;
  status: string;
  payload: unknown;
  result: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  creditsCharged: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type TaskView = {
  id: string;
  taskType: string;
  status: string;
  payload: unknown;
  result: unknown;
  error: { code: string; message: string } | null;
  creditsCharged: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type TaskSettlement =
  | { ok: true; result: unknown; loggedResult: unknown; cost: number }
  | { ok: false; errorCode: string; errorMessage: string; httpStatus: number };
