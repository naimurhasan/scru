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

const url = "https://shop.example/";
const crawlTask = { ...queuedTask, taskType: "CRAWL" };

const submit = (deps: ReturnType<typeof createDeps>, body: unknown) =>
  send(deps, "POST", "/v1/crawl", body);

describe("POST /v1/crawl", () => {
  it("queues a crawl task with defaults and answers 202", async () => {
    const deps = createDeps();
    deps.createTask.mockResolvedValue(crawlTask);
    const response = await submit(deps, { url });

    expect(response.status).toBe(202);
    expect(deps.createTask.mock.calls[0]?.[0]).toMatchObject({
      taskType: "CRAWL",
      payload: {
        url,
        maxDepth: 2,
        limit: 50,
        include: [],
        exclude: [],
        output: "html",
      },
    });
    expect(deps.enqueueCrawl).toHaveBeenCalledWith(
      {
        taskId,
        url,
        maxDepth: 2,
        limit: 50,
        include: [],
        exclude: [],
        output: "html",
        page: {
          jsRender: false,
          instructions: [],
          waitFor: null,
          waitMs: 0,
          screenshot: false,
          blockResources: true,
          proxy: null,
        },
      },
      1,
    );
  });

  it("needs enough credits for every page it may fetch", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 99 });
    const response = await submit(deps, { url, limit: 20, jsRender: true });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 100 });
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("passes the proxy country to every page", async () => {
    const deps = createDeps();
    await submit(deps, { url, premiumProxy: true, country: "gb", limit: 5 });

    expect(deps.enqueueCrawl.mock.calls[0]?.[0].page.proxy).toEqual({
      country: "GB",
      sessionId: null,
    });
  });

  it.each([
    [{ maxDepth: 6 }, "maxDepth"],
    [{ limit: 501 }, "limit"],
    [{ include: ["catalogue"] }, "include.0"],
    [{ output: "screenshot" }, "output"],
    [{ country: "US" }, "country"],
  ])("refuses %j", async (options, field) => {
    const deps = createDeps();
    const response = await submit(deps, { url, ...options });

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field }),
    ]);
  });

  it("refuses a premium proxy when none is set up", async () => {
    const response = await send(
      createDeps(),
      "POST",
      "/v1/crawl",
      { url, premiumProxy: true },
      undefined,
      { ...config, proxiesEnabled: false },
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /v1/crawl/{taskId}/pages", () => {
  const pages = [
    {
      position: 0,
      url,
      depth: 0,
      statusCode: 200,
      content: "<h1>Shop</h1>",
      error: null,
    },
  ];

  it("lists pages after the cursor", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue(crawlTask);
    deps.listCrawlPages.mockResolvedValue({ pages, nextCursor: 0 });
    const response = await send(
      deps,
      "GET",
      `/v1/crawl/${taskId}/pages?after=-1&limit=1`,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      pages,
      nextCursor: 0,
    });
    expect(deps.listCrawlPages).toHaveBeenCalledWith(taskId, {
      after: -1,
      limit: 1,
    });
  });

  it("answers 404 for a task that is not a crawl", async () => {
    const deps = createDeps();
    const response = await send(deps, "GET", `/v1/crawl/${taskId}/pages`);

    expect(response.status).toBe(404);
    expect(deps.listCrawlPages).not.toHaveBeenCalled();
  });

  it("answers 404 for an unknown task", async () => {
    const deps = createDeps();
    deps.findTask.mockResolvedValue(null);

    expect((await send(deps, "GET", `/v1/crawl/${taskId}/pages`)).status).toBe(
      404,
    );
  });
});
