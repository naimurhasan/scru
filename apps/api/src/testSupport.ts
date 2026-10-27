import type { PageOutcome, SearchOutcome } from "@scru/core";
import type { Task } from "@scru/db";
import { vi } from "vitest";
import { createApp } from "./app.ts";
import type { ApiConfig, ApiDeps } from "./deps.ts";
import type { ErrorBody } from "./errors/toErrorBody.ts";
import type { GoogleSearchResponse } from "./google/schemas.ts";

export const actor = {
  apiKeyId: "key-1",
  workspaceId: "workspace-1",
  credits: 100,
  concurrencyLimit: 2,
};

export const config: ApiConfig = {
  internalToken: "internal-token-for-tests-only",
  allowPrivateWebhooks: false,
  proxiesEnabled: true,
  extractorsEnabled: true,
};

export const workspaceId = "0b8f7a52-6c1d-4a0e-9d3b-2f4e5a6b7c8d";
export const taskId = "5f0c7c1e-3d57-4c0f-8a51-9f3f2f1d6b7a";

export const result: GoogleSearchResponse["result"] = {
  organicResults: [
    {
      position: 1,
      title: "Best CRM",
      link: "https://crm.org/best",
      snippet: "A guide",
      page: 1,
    },
  ],
  peopleAlsoAsk: [{ question: "What is a CRM?" }],
  relatedSearches: [{ query: "free crm" }],
  knowledgePanel: null,
};

export const found: Extract<SearchOutcome, { ok: true }> = {
  ok: true,
  result,
  html: "<html>results</html>",
  pages: 1,
};

export const fetched: Extract<PageOutcome, { ok: true }> = {
  ok: true,
  page: {
    url: "https://shop.example/deals",
    status: 200,
    html: '<h1>Daily deals</h1><a class="item" href="/p/1">Red chair</a>',
    screenshot: null,
    instructions: [],
  },
};

export const queuedTask: Task = {
  id: taskId,
  workspaceId: actor.workspaceId,
  apiKeyId: actor.apiKeyId,
  taskType: "GOOGLE",
  status: "QUEUED",
  priority: 1,
  idempotencyKey: null,
  payload: {
    query: "best crm",
    country: "US",
    pages: 1,
    resolveLinks: true,
    include: { html: false },
  },
  result: null,
  errorCode: null,
  errorMessage: null,
  creditsCharged: 0,
  webhookUrl: null,
  createdAt: new Date("2026-10-13T10:00:00.000Z"),
  startedAt: null,
  completedAt: null,
};

export const createDeps = () => ({
  findApiKey: vi.fn<ApiDeps["findApiKey"]>(async () => actor),
  findWorkspaceActor: vi.fn<ApiDeps["findWorkspaceActor"]>(async () => ({
    ...actor,
    apiKeyId: null,
  })),
  chargeCredits: vi.fn<ApiDeps["chargeCredits"]>(async () => 95),
  recordRequest: vi.fn<ApiDeps["recordRequest"]>(async () => undefined),
  searchGoogle: vi.fn<ApiDeps["searchGoogle"]>(async () => found),
  fetchPage: vi.fn<ApiDeps["fetchPage"]>(async () => fetched),
  createTask: vi.fn<ApiDeps["createTask"]>(async () => queuedTask),
  findTask: vi.fn<ApiDeps["findTask"]>(async () => queuedTask),
  enqueueTask: vi.fn<ApiDeps["enqueueTask"]>(async () => undefined),
  enqueueCrawl: vi.fn<ApiDeps["enqueueCrawl"]>(async () => undefined),
  enqueueExtractor: vi.fn<ApiDeps["enqueueExtractor"]>(async () => undefined),
  listExtractors: vi.fn<ApiDeps["listExtractors"]>(async () => []),
  findLatestExtractor: vi.fn<ApiDeps["findLatestExtractor"]>(async () => null),
  listCrawlPages: vi.fn<ApiDeps["listCrawlPages"]>(async () => ({
    pages: [],
    nextCursor: null,
  })),
  limits: {
    takeRateSlot: vi.fn<ApiDeps["limits"]["takeRateSlot"]>(async () => ({
      allowed: true,
      limit: 10,
      remaining: 9,
    })),
    acquireConcurrency: vi.fn<ApiDeps["limits"]["acquireConcurrency"]>(
      async (_workspace, limit) => ({ acquired: true, limit, current: 1 }),
    ),
    releaseConcurrency: vi.fn<ApiDeps["limits"]["releaseConcurrency"]>(
      async () => undefined,
    ),
  },
});

const KEY_HEADERS = { Authorization: "Bearer scru_test" };

export const send = (
  deps: ApiDeps,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = KEY_HEADERS,
  appConfig: ApiConfig = config,
) =>
  createApp(deps, appConfig).request(path, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    ...(body !== undefined && {
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  });

export const search = (
  deps: ApiDeps,
  body: unknown,
  headers: Record<string, string> = KEY_HEADERS,
) => send(deps, "POST", "/v1/monitor/google", body, headers);

export const errorOf = async (response: Response) =>
  ((await response.json()) as ErrorBody).error;
