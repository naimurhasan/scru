import type { CrawlJob, StoredExtractor } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { createCrawlProcessor } from "./createCrawlProcessor.ts";
import { createPageReader } from "./createPageReader.ts";
import type { PreparationDeps } from "./prepareSiteExtractor.ts";
import { resolveCrawlExtractor } from "./resolveCrawlExtractor.ts";

const page: CrawlJob["page"] = {
  jsRender: false,
  instructions: [],
  waitFor: null,
  waitMs: 0,
  screenshot: false,
  blockResources: true,
  proxy: null,
};

const job: CrawlJob = {
  taskId: "task-1",
  workspaceId: "workspace-1",
  url: "https://shop.example/",
  maxDepth: 0,
  limit: 1,
  include: [],
  exclude: [],
  output: "json",
  page,
};

const extractor: StoredExtractor = {
  id: "extractor-1",
  host: "shop.example",
  version: 3,
  model: "test/model",
  createdAt: new Date("2026-10-28T10:00:00.000Z"),
  fetchOptions: page,
  pageTypes: [
    {
      name: "home",
      pattern: "/",
      itemSelector: null,
      fillRate: 1,
      fields: [
        { name: "title", description: "", selector: "h1", attribute: null },
      ],
    },
  ],
};

const failingPreparation: PreparationDeps = {
  fetchPage: async () => ({ ok: false, reason: "blocked" }),
  fetchRobots: async () => null,
  completeJson: vi.fn(),
  model: "test/model",
  saveExtractor: vi.fn(),
  pauseMs: 0,
};

describe("createPageReader", () => {
  it("returns the page's records for JSON", () => {
    expect(
      createPageReader("json", extractor.pageTypes)(
        "<h1>Shop</h1>",
        "https://shop.example/",
      ),
    ).toEqual({ content: null, pageType: "home", data: { title: "Shop" } });
  });

  it("returns nothing for a page no page type fits", () => {
    expect(
      createPageReader("json", extractor.pageTypes)(
        "<p>About</p>",
        "https://shop.example/about/team",
      ),
    ).toEqual({ content: null, pageType: null, data: null });
  });

  it("converts the page for other outputs", () => {
    expect(
      createPageReader("markdown", [])(
        "<h1>Shop</h1>",
        "https://shop.example/",
      ),
    ).toEqual({ content: "# Shop", pageType: null, data: null });
  });
});

describe("resolveCrawlExtractor", () => {
  it("uses the site's latest extractor without preparing", async () => {
    expect(
      await resolveCrawlExtractor(
        { findLatestExtractor: async () => extractor, preparation: null },
        job,
      ),
    ).toEqual({
      extractor: { id: "extractor-1", version: 3, prepared: false },
      pageTypes: extractor.pageTypes,
      preparationCredits: 0,
    });
  });

  it("finds nothing when the site has no extractor and preparing is off", async () => {
    expect(
      await resolveCrawlExtractor(
        { findLatestExtractor: async () => null, preparation: null },
        job,
      ),
    ).toMatchObject({ extractor: null, preparationCredits: 0 });
  });
});

describe("createCrawlProcessor", () => {
  it("stops before crawling when no extractor could be prepared", async () => {
    const fetchPage = vi.fn(failingPreparation.fetchPage);
    const process = createCrawlProcessor({
      fetchPage,
      fetchRobots: async () => null,
      savePage: vi.fn(),
      extractors: {
        findLatestExtractor: async () => null,
        preparation: { ...failingPreparation, fetchPage },
      },
      pauseMs: 0,
    });

    expect(await process({ data: job })).toMatchObject({
      pagesFetched: 0,
      stoppedBy: "no_extractor",
      extractor: null,
    });
    expect(failingPreparation.completeJson).not.toHaveBeenCalled();
  });

  it("saves each page's records with the site's extractor", async () => {
    const savePage = vi.fn(async () => undefined);
    const process = createCrawlProcessor({
      fetchPage: async ({ url }) => ({
        ok: true,
        page: {
          url,
          status: 200,
          html: "<h1>Shop</h1>",
          screenshot: null,
          instructions: [],
        },
      }),
      fetchRobots: async () => null,
      savePage,
      extractors: {
        findLatestExtractor: async () => extractor,
        preparation: null,
      },
      pauseMs: 0,
    });

    expect(await process({ data: job })).toMatchObject({
      pagesFetched: 1,
      extractor: { id: "extractor-1", prepared: false },
      preparationCredits: 0,
    });
    expect(savePage).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ pageType: "home", data: { title: "Shop" } }),
    );
  });
});
