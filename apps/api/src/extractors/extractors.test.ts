import type { StoredExtractor } from "@scru/core";
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
import type { ExtractResponse } from "./schemas.ts";

const extractor: StoredExtractor = {
  id: "extractor-1",
  host: "shop.example",
  version: 2,
  model: "test/model",
  createdAt: new Date("2026-10-27T10:00:00.000Z"),
  fetchOptions: {
    jsRender: false,
    instructions: [],
    waitFor: null,
    waitMs: 0,
    screenshot: false,
    blockResources: true,
    proxy: null,
  },
  pageTypes: [
    {
      name: "product_list",
      pattern: "/c/*",
      itemSelector: "article",
      fillRate: 1,
      fields: [
        { name: "title", description: "", selector: "h3", attribute: null },
        { name: "link", description: "", selector: "a", attribute: "href" },
      ],
    },
  ],
};

const listingHtml =
  '<article><h3>Chair</h3><a href="/p/1">x</a></article><article><h3>Lamp</h3><a href="/p/2">x</a></article>';

describe("POST /v1/extractors", () => {
  it("queues a preparation that may fetch 16 pages plus 20 credits", async () => {
    const deps = createDeps();
    deps.createTask.mockResolvedValue({ ...queuedTask, taskType: "EXTRACTOR" });
    const response = await send(deps, "POST", "/v1/extractors", {
      url: "https://shop.example/",
    });

    expect(response.status).toBe(202);
    expect(deps.enqueueExtractor).toHaveBeenCalledWith(
      {
        taskId,
        workspaceId: actor.workspaceId,
        url: "https://shop.example/",
        page: extractor.fetchOptions,
      },
      1,
    );
  });

  it("needs credits for every sample page and the preparation", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 35 });
    const response = await send(deps, "POST", "/v1/extractors", {
      url: "https://shop.example/",
    });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 36 });
  });

  it("refuses when extractors are not set up", async () => {
    const response = await send(
      createDeps(),
      "POST",
      "/v1/extractors",
      { url: "https://shop.example/" },
      undefined,
      { ...config, extractorsEnabled: false },
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /v1/extractors", () => {
  it("lists the workspace's extractors", async () => {
    const deps = createDeps();
    deps.listExtractors.mockResolvedValue([extractor]);
    const response = await send(deps, "GET", "/v1/extractors");
    const body = (await response.json()) as {
      extractors: Array<{
        id: string;
        createdAt: string;
        pageTypes: unknown[];
      }>;
    };

    expect(deps.listExtractors).toHaveBeenCalledWith(actor.workspaceId);
    expect(body.extractors).toEqual([
      {
        id: "extractor-1",
        host: "shop.example",
        version: 2,
        pageTypes: extractor.pageTypes,
        createdAt: "2026-10-27T10:00:00.000Z",
      },
    ]);
  });
});

describe("POST /v1/extract", () => {
  const extract = (deps: ReturnType<typeof createDeps>, url: string) =>
    send(deps, "POST", "/v1/extract", { url });

  it("fetches the page and applies the matching page type", async () => {
    const deps = createDeps();
    deps.findLatestExtractor.mockResolvedValue(extractor);
    deps.fetchPage.mockResolvedValue({
      ok: true,
      page: {
        url: "https://shop.example/c/chairs",
        status: 200,
        html: listingHtml,
        screenshot: null,
        instructions: [],
      },
    });
    const response = await extract(deps, "https://shop.example/c/chairs");

    expect(response.status).toBe(200);
    expect(((await response.json()) as ExtractResponse).result).toEqual({
      url: "https://shop.example/c/chairs",
      statusCode: 200,
      extractor: { id: "extractor-1", version: 2 },
      pageType: "product_list",
      data: [
        { title: "Chair", link: "https://shop.example/p/1" },
        { title: "Lamp", link: "https://shop.example/p/2" },
      ],
    });
    expect(deps.findLatestExtractor).toHaveBeenCalledWith(
      actor.workspaceId,
      "shop.example",
    );
    expect(response.headers.get("X-Credits-Charged")).toBe("1");
    expect(deps.recordRequest.mock.calls[0]?.[0].engine).toBe("extract");
  });

  it("answers 404 when the site has no extractor", async () => {
    const deps = createDeps();
    const response = await extract(deps, "https://shop.example/c/chairs");

    expect(response.status).toBe(404);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("answers 404 with the known patterns when no page type matches", async () => {
    const deps = createDeps();
    deps.findLatestExtractor.mockResolvedValue(extractor);
    const response = await extract(deps, "https://shop.example/about");

    expect(response.status).toBe(404);
    expect((await errorOf(response)).details).toEqual({ patterns: ["/c/*"] });
    expect(deps.chargeCredits).not.toHaveBeenCalled();
  });

  it("charges nothing when the page cannot be fetched", async () => {
    const deps = createDeps();
    deps.findLatestExtractor.mockResolvedValue(extractor);
    deps.fetchPage.mockResolvedValue({ ok: false, reason: "blocked" });
    const response = await extract(deps, "https://shop.example/c/chairs");

    expect(response.status).toBe(502);
    expect(deps.chargeCredits).not.toHaveBeenCalled();
  });
});
