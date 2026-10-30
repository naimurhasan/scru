import { describe, expect, it } from "vitest";
import {
  actor,
  config,
  createDeps,
  errorOf,
  queuedTask,
  send,
  storedExtractor,
  taskId,
} from "../testSupport.ts";

const urls = ["https://shop.example/p/1", "https://other.example/"];
const batchTask = { ...queuedTask, taskType: "BATCH", payload: { urls } };

const submit = (deps: ReturnType<typeof createDeps>, body: unknown) =>
  send(deps, "POST", "/v1/batch", body);

describe("POST /v1/batch", () => {
  it("queues every address as one task", async () => {
    const deps = createDeps();
    deps.createTask.mockResolvedValue(batchTask);
    const response = await submit(deps, { urls, output: "markdown" });

    expect(response.status).toBe(202);
    expect(deps.createTask.mock.calls[0]?.[0]).toMatchObject({
      taskType: "BATCH",
      payload: { urls, output: "markdown" },
    });
    expect(deps.enqueueBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId,
        workspaceId: actor.workspaceId,
        urls,
        output: "markdown",
      }),
      1,
    );
  });

  it("needs enough credits for every address", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 9 });
    const response = await submit(deps, { urls, jsRender: true });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 10 });
  });

  it("reserves preparing for each site with no extractor in a JSON batch", async () => {
    const deps = createDeps();
    deps.findLatestExtractor.mockImplementation(async (_workspace, host) =>
      host === "shop.example" ? storedExtractor : null,
    );
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 37 });
    const response = await submit(deps, { urls, output: "json" });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 38 });
  });

  it("refuses JSON for a site with no extractor when preparing is off", async () => {
    const deps = createDeps();
    const response = await send(
      deps,
      "POST",
      "/v1/batch",
      { urls, output: "json" },
      undefined,
      { ...config, extractorsEnabled: false },
    );

    expect(response.status).toBe(400);
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("rejects an empty list", async () => {
    const response = await submit(createDeps(), { urls: [] });

    expect(response.status).toBe(400);
  });
});

describe("GET /v1/batch/{taskId}", () => {
  it("shows how many addresses are done", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue(batchTask);
    deps.countCrawlPages.mockResolvedValue(1);
    const response = await send(deps, "GET", `/v1/batch/${taskId}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      progress: { done: 1, total: 2 },
    });
  });

  it("does not show other task types", async () => {
    const response = await send(createDeps(), "GET", `/v1/batch/${taskId}`);

    expect(response.status).toBe(404);
  });
});

describe("GET /v1/batch/{taskId}/pages", () => {
  it("lists the batch's results", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue(batchTask);
    const response = await send(
      deps,
      "GET",
      `/v1/batch/${taskId}/pages?limit=5`,
    );

    expect(response.status).toBe(200);
    expect(deps.listCrawlPages).toHaveBeenCalledWith(taskId, {
      after: -1,
      limit: 5,
    });
  });
});
