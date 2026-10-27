import type { FetchJob, PageOutcome } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { type SampleDeps, sampleSite } from "./sampleSite.ts";

const options: Omit<FetchJob, "url"> = {
  jsRender: false,
  instructions: [],
  waitFor: null,
  waitMs: 0,
  screenshot: false,
  blockResources: true,
  proxy: null,
};

const categories = Array.from(
  { length: 8 },
  (_, index) =>
    `<a href="/catalogue/category/books/c${index}_${index}/index.html">c</a>`,
);
const products = Array.from(
  { length: 6 },
  (_, index) => `<a href="/catalogue/book-${index}_${index}/index.html">b</a>`,
);
const home = [
  ...categories,
  ...products,
  `<a href="/about">about</a>`,
  `<a href="/private/admin">admin</a>`,
  `<a href="/cover.jpg">cover</a>`,
  `<a href="https://elsewhere.example/">out</a>`,
].join("");

const createDeps = () => ({
  fetchPage: vi.fn<SampleDeps["fetchPage"]>(
    async ({ url }): Promise<PageOutcome> => ({
      ok: true,
      page: {
        url,
        status: 200,
        html: url === "https://shop.example/" ? home : `<h1>${url}</h1>`,
        screenshot: null,
        instructions: [],
      },
    }),
  ),
  fetchRobots: vi.fn<SampleDeps["fetchRobots"]>(
    async () => "User-agent: *\nDisallow: /private",
  ),
  pause: vi.fn<SampleDeps["pause"]>(async () => undefined),
});

describe("sampleSite", () => {
  it("fetches the start page and up to five pages of each repeated page type", async () => {
    const deps = createDeps();
    const sample = await sampleSite(deps, "https://shop.example/", options);
    const fetched = deps.fetchPage.mock.calls.map(([job]) => job.url);

    expect(fetched[0]).toBe("https://shop.example/");
    expect(fetched.filter((url) => url.includes("/category/"))).toHaveLength(5);
    expect(fetched.filter((url) => url.includes("/book-"))).toHaveLength(5);
    expect(fetched).not.toContain("https://shop.example/about");
    expect(sample.pagesFetched).toBe(11);
    expect(sample.pages).toHaveLength(11);
  });

  it("never fetches pages robots.txt forbids, files or other sites", async () => {
    const deps = createDeps();
    await sampleSite(deps, "https://shop.example/", options);
    const fetched = deps.fetchPage.mock.calls.map(([job]) => job.url);

    expect(fetched.some((url) => /private|cover|elsewhere/.test(url))).toBe(
      false,
    );
  });

  it("returns nothing when the start page fails", async () => {
    const deps = createDeps();
    deps.fetchPage.mockResolvedValue({ ok: false, reason: "blocked" });

    expect(await sampleSite(deps, "https://shop.example/", options)).toEqual({
      pages: [],
      pagesFetched: 0,
    });
    expect(deps.fetchPage).toHaveBeenCalledTimes(1);
  });

  it("returns nothing when robots.txt forbids the start page", async () => {
    const deps = createDeps();
    deps.fetchRobots.mockResolvedValue("User-agent: *\nDisallow: /");
    await sampleSite(deps, "https://shop.example/", options);

    expect(deps.fetchPage).not.toHaveBeenCalled();
  });
});
