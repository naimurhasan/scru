import type {
  CrawlJob,
  FetchJob,
  GoogleSearchJob,
  PageOutcome,
  SearchOutcome,
} from "@scru/core";
import type {
  CrawlPageList,
  NewRequestLog,
  NewTask,
  RequestActor,
  Task,
} from "@scru/db";
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
  fetchPage: (job: FetchJob) => Promise<PageOutcome>;
  createTask: (task: NewTask) => Promise<Task | null>;
  findTask: (workspaceId: string, taskId: string) => Promise<Task | null>;
  enqueueTask: (job: GoogleSearchJob, priority: number) => Promise<void>;
  enqueueCrawl: (job: CrawlJob, priority: number) => Promise<void>;
  listCrawlPages: (
    taskId: string,
    page: { after: number; limit: number },
  ) => Promise<CrawlPageList>;
  limits: UsageLimiter;
};

export type ApiConfig = {
  internalToken: string;
  allowPrivateWebhooks: boolean;
  proxiesEnabled: boolean;
};

export type ApiEnv = {
  Variables: {
    actor: RequestActor;
  };
};

export type ApiApp = OpenAPIHono<ApiEnv>;
