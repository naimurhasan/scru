import type { CrawledPage, CrawlJob, FetchJob, PageOutcome } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { normalizeUrl } from "./normalizeUrl.ts";
import { isAllowedByRobots, parseRobots } from "./robots.ts";
import { runCrawl, type CrawlDeps } from "./runCrawl.ts";
import { shouldVisit } from "./shouldVisit.ts";

describe("normalizeUrl", () => {
  it("drops the fragment and sorts the query", () => {
    expect(normalizeUrl("https://Shop.example/a?b=2&a=1#top")).toBe(
      "https://shop.example/a?a=1&b=2",
    );
  });
});

describe("shouldVisit", () => {
  const rules = { host: "shop.example", include: [], exclude: [] };

  it("stays on the same host", () => {
    expect(shouldVisit("https://shop.example/a", rules)).toBe(true);
    expect(shouldVisit("https://blog.shop.example/a", rules)).toBe(false);
  });

  it("skips files that are not pages", () => {
    expect(shouldVisit("https://shop.example/cover.JPG", rules)).toBe(false);
    expect(shouldVisit("https://shop.example/report.pdf", rules)).toBe(false);
  });

  it("applies include and exclude patterns to the path", () => {
    const filtered = {
      ...rules,
      include: ["/catalogue/*"],
      exclude: ["*/page-*"],
    };

    expect(shouldVisit("https://shop.example/catalogue/book-1", filtered)).toBe(
      true,
    );
    expect(
      shouldVisit("https://shop.example/catalogue/page-2.html", filtered),
    ).toBe(false);
    expect(shouldVisit("https://shop.example/about", filtered)).toBe(false);
  });
});

describe("robots", () => {
  const robots = parseRobots(`
User-agent: GoogleBot
Disallow: /

User-agent: *
Disallow: /private
Allow: /private/press
Disallow: /*.json$  # data files

User-agent: other
Disallow: /everything
`);

  it("reads only the rules for every agent", () => {
    expect(robots).toEqual([
      { allow: false, pattern: "/private" },
      { allow: true, pattern: "/private/press" },
      { allow: false, pattern: "/*.json$" },
    ]);
  });

  it.each([
    ["/", true],
    ["/private/notes", false],
    ["/private/press/2026", true],
    ["/feed.json", false],
    ["/feed.json?v=2", true],
    ["/everything", true],
  ])("decides %s", (path, allowed) => {
    expect(isAllowedByRobots(robots, path)).toBe(allowed);
  });

  it("allows everything without rules", () => {
    expect(isAllowedByRobots(parseRobots(""), "/anything")).toBe(true);
  });
});

const SITE: Record<string, string> = {
  "https://shop.example/": `<a href="/c/1">c1</a><a href="/c/2">c2</a><a href="/private/x">p</a><a href="https://elsewhere.example/">out</a>`,
  "https://shop.example/c/1": `<a href="/c/1/item">item</a><a href="/">home</a>`,
  "https://shop.example/c/2": `<a href="/c/2/item">item</a>`,
  "https://shop.example/c/1/item": `<h1>Item</h1>`,
  "https://shop.example/c/2/item": `<h1>Item 2</h1>`,
};

const job: CrawlJob = {
  taskId: "task-1",
  url: "https://shop.example/",
  maxDepth: 2,
  limit: 50,
  include: [],
  exclude: [],
  output: "markdown",
  page: {
    jsRender: false,
    instructions: [],
    waitFor: null,
    waitMs: 0,
    screenshot: false,
    blockResources: true,
    proxy: null,
  },
};

const createDeps = () => {
  const saved: CrawledPage[] = [];
  const deps = {
    fetchPage: vi.fn<CrawlDeps["fetchPage"]>(
      async ({ url }: FetchJob): Promise<PageOutcome> => {
        const html = SITE[url];
        return html === undefined
          ? { ok: false, reason: "blocked" }
          : {
              ok: true,
              page: {
                url,
                status: 200,
                html,
                screenshot: null,
                instructions: [],
              },
            };
      },
    ),
    fetchRobots: vi.fn<CrawlDeps["fetchRobots"]>(
      async () => "User-agent: *\nDisallow: /private",
    ),
    savePage: vi.fn<CrawlDeps["savePage"]>(async (page) => {
      saved.push(page);
    }),
    pause: vi.fn<CrawlDeps["pause"]>(async () => undefined),
  };
  return { deps, saved };
};

describe("runCrawl", () => {
  it("visits the site breadth first, once per page, within robots.txt", async () => {
    const { deps, saved } = createDeps();
    const outcome = await runCrawl(deps, job);

    expect(saved.map(({ position, url, depth }) => [position, url, depth])).toEqual([
      [0, "https://shop.example/", 0],
      [1, "https://shop.example/c/1", 1],
      [2, "https://shop.example/c/2", 1],
      [3, "https://shop.example/c/1/item", 2],
      [4, "https://shop.example/c/2/item", 2],
    ]);
    expect(outcome).toEqual({
      pagesFetched: 5,
      pagesFailed: 0,
      pagesQueued: 0,
      creditsPerPage: 1,
      stoppedBy: "finished",
    });
    expect(saved[3]?.content).toBe("# Item");
  });

  it("stops at the depth limit", async () => {
    const { deps, saved } = createDeps();
    await runCrawl(deps, { ...job, maxDepth: 1 });

    expect(saved).toHaveLength(3);
  });

  it("stops at the page limit and reports what was left", async () => {
    const { deps } = createDeps();
    const outcome = await runCrawl(deps, { ...job, limit: 2 });

    expect(outcome).toMatchObject({
      pagesFetched: 2,
      pagesQueued: 2,
      stoppedBy: "limit",
    });
  });

  it("records failed pages and keeps going", async () => {
    const { deps, saved } = createDeps();
    deps.fetchPage.mockImplementationOnce(async () => ({
      ok: true,
      page: {
        url: job.url,
        status: 200,
        html: `<a href="/missing">x</a><a href="/c/2">c2</a>`,
        screenshot: null,
        instructions: [],
      },
    }));
    const outcome = await runCrawl(deps, { ...job, maxDepth: 1 });

    expect(saved[1]).toEqual({
      position: 1,
      url: "https://shop.example/missing",
      depth: 1,
      statusCode: null,
      content: null,
      error: "blocked",
    });
    expect(outcome).toMatchObject({ pagesFetched: 2, pagesFailed: 1 });
  });

  it("pauses between pages but not before the first", async () => {
    const { deps } = createDeps();
    await runCrawl(deps, job);

    expect(deps.pause).toHaveBeenCalledTimes(4);
  });

  it("prices pages the way Fetch does", async () => {
    const { deps } = createDeps();
    const outcome = await runCrawl(deps, {
      ...job,
      page: {
        ...job.page,
        jsRender: true,
        proxy: { country: null, sessionId: null },
      },
    });

    expect(outcome.creditsPerPage).toBe(25);
  });
});

describe("runCrawl and robots.txt", () => {
  it("fetches nothing when the start page is disallowed", async () => {
    const { deps } = createDeps();
    deps.fetchRobots.mockResolvedValue("User-agent: *\nDisallow: /");
    const outcome = await runCrawl(deps, job);

    expect(deps.fetchPage).not.toHaveBeenCalled();
    expect(outcome.pagesFetched).toBe(0);
  });

  it("crawls freely when the site has no robots.txt", async () => {
    const { deps, saved } = createDeps();
    deps.fetchRobots.mockResolvedValue(null);
    await runCrawl(deps, job);

    expect(saved.map(({ url }) => url)).toContain(
      "https://shop.example/private/x",
    );
  });
});
