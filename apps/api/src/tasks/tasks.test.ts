import type { TaskView } from "@scru/core";
import { describe, expect, it } from "vitest";
import {
  actor,
  config,
  createDeps,
  errorOf,
  queuedTask,
  send,
  taskId,
} from "../testSupport.ts";

const taskOf = async (response: Response) =>
  ((await response.json()) as { task: TaskView }).task;

const submit = (
  deps: ReturnType<typeof createDeps>,
  body: unknown,
  appConfig = config,
) => send(deps, "POST", "/v1/async/task", body, undefined, appConfig);

const validBody = { taskType: "GOOGLE", payload: { query: "best crm" } };

describe("POST /v1/async/task", () => {
  it("queues a task and returns it immediately", async () => {
    const deps = createDeps();
    const response = await submit(deps, validBody);

    expect(response.status).toBe(202);
    expect(await taskOf(response)).toMatchObject({
      id: taskId,
      status: "QUEUED",
      result: null,
      error: null,
      createdAt: "2026-10-13T10:00:00.000Z",
    });
    expect(deps.createTask).toHaveBeenCalledWith({
      workspaceId: actor.workspaceId,
      apiKeyId: actor.apiKeyId,
      taskType: "GOOGLE",
      priority: 1,
      idempotencyKey: null,
      payload: {
        query: "best crm",
        country: "US",
        pages: 1,
        include: { html: false },
      },
      webhookUrl: null,
    });
    expect(deps.enqueueTask).toHaveBeenCalledWith(
      {
        query: "best crm",
        country: "US",
        language: "en",
        pages: 1,
        includeHtml: false,
        taskId,
      },
      1,
    );
    expect(deps.searchGoogle).not.toHaveBeenCalled();
    expect(deps.chargeCredits).not.toHaveBeenCalled();
  });

  it("passes priority, idempotency key and webhook through", async () => {
    const deps = createDeps();
    deps.createTask.mockResolvedValue({ ...queuedTask, priority: 7 });
    await submit(deps, {
      ...validBody,
      priority: 7,
      idempotencyKey: "order-42",
      webhook: { url: "https://example.com/hook" },
    });

    expect(deps.createTask.mock.calls[0]?.[0]).toMatchObject({
      priority: 7,
      idempotencyKey: "order-42",
      webhookUrl: "https://example.com/hook",
    });
    expect(deps.enqueueTask.mock.calls[0]?.[1]).toBe(7);
  });

  it("rejects a repeated idempotency key", async () => {
    const deps = createDeps();
    deps.createTask.mockResolvedValue(null);
    const response = await submit(deps, {
      ...validBody,
      idempotencyKey: "order-42",
    });

    expect(response.status).toBe(409);
    expect((await errorOf(response)).code).toBe("CONFLICT");
    expect(deps.enqueueTask).not.toHaveBeenCalled();
  });

  it("refuses to queue without enough credits", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 2 });
    const response = await submit(deps, validBody);
    const error = await errorOf(response);

    expect(response.status).toBe(403);
    expect(error.code).toBe("INSUFFICIENT_CREDITS");
    expect(error.details).toEqual({ required: 3 });
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("rejects a webhook pointing at a private address", async () => {
    const deps = createDeps();
    const response = await submit(deps, {
      ...validBody,
      webhook: { url: "http://169.254.169.254/latest/meta-data" },
    });
    const error = await errorOf(response);

    expect(response.status).toBe(400);
    expect(error.details).toEqual([
      expect.objectContaining({ field: "webhook.url" }),
    ]);
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("allows a private webhook when the server is configured for it", async () => {
    const deps = createDeps();
    const response = await submit(
      deps,
      { ...validBody, webhook: { url: "http://localhost:9000/hook" } },
      { ...config, allowPrivateWebhooks: true },
    );

    expect(response.status).toBe(202);
  });

  it.each([
    [{ payload: { query: "best crm" } }, "taskType"],
    [{ taskType: "BING", payload: { query: "best crm" } }, "taskType"],
    [{ taskType: "GOOGLE", payload: { query: "" } }, "payload.query"],
    [{ ...validBody, priority: 11 }, "priority"],
    [{ ...validBody, webhook: { url: "not a url" } }, "webhook.url"],
  ])("rejects an invalid body %#", async (body, field) => {
    const deps = createDeps();
    const response = await submit(deps, body);

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field }),
    ]);
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("requires a key", async () => {
    const deps = createDeps();
    const response = await send(deps, "POST", "/v1/async/task", validBody, {});

    expect(response.status).toBe(401);
  });
});

describe("GET /v1/async/task/{taskId}", () => {
  const get = (deps: ReturnType<typeof createDeps>, id: string) =>
    send(deps, "GET", `/v1/async/task/${id}`);

  it("returns a completed task with its result", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue({
      ...queuedTask,
      status: "COMPLETED",
      result: { organicResults: [] },
      creditsCharged: 3,
      startedAt: new Date("2026-10-13T10:00:01.000Z"),
      completedAt: new Date("2026-10-13T10:00:14.000Z"),
    });
    const response = await get(deps, taskId);

    expect(response.status).toBe(200);
    expect(await taskOf(response)).toMatchObject({
      status: "COMPLETED",
      result: { organicResults: [] },
      creditsCharged: 3,
      completedAt: "2026-10-13T10:00:14.000Z",
    });
    expect(deps.findTask).toHaveBeenCalledWith(actor.workspaceId, taskId);
  });

  it("returns the error of a failed task", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue({
      ...queuedTask,
      status: "FAILED",
      errorCode: "FETCH_FAILED",
      errorMessage: "Google could not be fetched (captcha)",
    });

    expect((await taskOf(await get(deps, taskId))).error).toEqual({
      code: "FETCH_FAILED",
      message: "Google could not be fetched (captcha)",
    });
  });

  it("returns 404 for a task of another workspace", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue(null);
    const response = await get(deps, taskId);

    expect(response.status).toBe(404);
    expect((await errorOf(response)).code).toBe("NOT_FOUND");
  });

  it("rejects a malformed id before touching the database", async () => {
    const deps = createDeps();
    const response = await get(deps, "not-a-uuid");

    expect(response.status).toBe(400);
    expect(deps.findTask).not.toHaveBeenCalled();
  });
});
