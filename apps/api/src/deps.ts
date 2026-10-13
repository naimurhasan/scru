import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import type { NewRequestLog, NewTask, RequestActor, Task } from "@scru/db";
import type { UsageLimiter } from "@scru/queue";
import type { OpenAPIHono } from "@hono/zod-openapi";

export type ApiDeps = {
  findApiKey: (keyHash: string) => Promise<RequestActor | null>;
  findWorkspaceActor: (workspaceId: string) => Promise<RequestActor | null>;
  chargeCredits: (
    workspaceId: string,
    amount: number,
  ) => Promise<number | null>;
  recordRequest: (log: NewRequestLog) => Promise<void>;
  searchGoogle: (job: GoogleSearchJob) => Promise<SearchOutcome>;
  createTask: (task: NewTask) => Promise<Task | null>;
  findTask: (workspaceId: string, taskId: string) => Promise<Task | null>;
  enqueueTask: (job: GoogleSearchJob, priority: number) => Promise<void>;
  limits: UsageLimiter;
};

export type ApiConfig = {
  internalToken: string;
  allowPrivateWebhooks: boolean;
};

export type ApiEnv = {
  Variables: {
    actor: RequestActor;
  };
};

export type ApiApp = OpenAPIHono<ApiEnv>;
