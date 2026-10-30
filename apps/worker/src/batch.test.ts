import type {
  BatchJob,
  FetchJob,
  PageOutcome,
  StoredExtractor,
} from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { createBatchProcessor } from "./createBatchProcessor.ts";
import { mapWithConcurrency } from "./mapWithConcurrency.ts";

const page: BatchJob["page"] = {
  jsRender: false,
  instructions: [],
  waitFor: null,
  waitMs: 0,
  screenshot: false,
  blockResources: true,
  proxy: null,
};

const job = (output: BatchJob["output"], urls: string[]): BatchJob => ({
  taskId: "task-1",
  workspaceId: "workspace-1",
  urls,
  output,
  page,
});

const extractor: StoredExtractor = {
  id: "extractor-1",
  host: "shop.example",
  version: 1,
  model: "test/model",
  createdAt: new Date("2026-10-28T10:00:00.000Z"),
  fetchOptions: page,
  pageTypes: [
    {
      name: "product",
      pattern: "/p/*",
      itemSelector: null,
      fillRate: 1,
      fields: [
        { name: "title", description: "", selector: "h1", attribute: null },
      ],
    },
  ],
};

const fetchPage = async ({ url }: FetchJob): Promise<PageOutcome> =>
  url.includes("broken")
    ? { ok: false, reason: "blocked" }
    : {
        ok: true,
        page: {
          url,
          status: 200,
          html: "<h1>Lamp</h1>",
          screenshot: null,
          instructions: [],
        },
      };

describe("mapWithConcurrency", () => {
  it("keeps results in input order and never runs more than the limit", async () => {
    let running = 0;
    let peak = 0;
    const results = await mapWithConcurrency(
      [30, 10, 20, 0],
      2,
      async (ms, index) => {
        running += 1;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, ms));
        running -= 1;
        return index;
      },
    );

    expect(results).toEqual([0, 1, 2, 3]);
    expect(peak).toBe(2);
  });
});

describe("createBatchProcessor", () => {
  it("saves every address in its position and counts failures", async () => {
    const savePage = vi.fn(async () => undefined);
    const process = createBatchProcessor({
      fetchPage,
      savePage,
      extractors: { findLatestExtractor: async () => null, preparation: null },
      concurrency: 2,
    });

    expect(
      await process({
        data: job("markdown", [
          "https://a.example/",
          "https://broken.example/",
        ]),
      }),
    ).toEqual({
      pagesFetched: 1,
      pagesFailed: 1,
      creditsPerPage: 1,
      preparationCredits: 0,
    });
    expect(savePage).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ position: 0, content: "# Lamp", error: null }),
    );
    expect(savePage).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({
        position: 1,
        statusCode: null,
        error: "blocked",
      }),
    );
  });

  it("extracts JSON with each site's extractor and skips sites without one", async () => {
    const savePage = vi.fn(async () => undefined);
    const findLatestExtractor = vi.fn(
      async (_workspaceId: string, host: string) =>
        host === "shop.example" ? extractor : null,
    );
    const process = createBatchProcessor({
      fetchPage,
      savePage,
      extractors: { findLatestExtractor, preparation: null },
      concurrency: 3,
    });

    expect(
      await process({
        data: job("json", [
          "https://shop.example/p/1",
          "https://shop.example/p/2",
          "https://other.example/",
        ]),
      }),
    ).toMatchObject({ pagesFetched: 2, pagesFailed: 1 });
    expect(findLatestExtractor).toHaveBeenCalledTimes(2);
    expect(savePage).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({
        position: 1,
        pageType: "product",
        data: { title: "Lamp" },
      }),
    );
    expect(savePage).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ position: 2, error: "no_extractor" }),
    );
  });
});
