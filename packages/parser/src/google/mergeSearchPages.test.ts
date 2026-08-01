import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { mergeSearchPages } from "./mergeSearchPages.ts";
import { parseGoogleSearchPages } from "./parseGoogleSearchPages.ts";
import type { GoogleSearchResult, OrganicResult } from "./types.ts";

const organic = (title: string, page: number): OrganicResult => ({
  position: 1,
  title,
  link: `https://example.com/${title}`,
  snippet: "",
  page,
});

const page = (overrides: Partial<GoogleSearchResult>): GoogleSearchResult => ({
  organicResults: [],
  peopleAlsoAsk: [],
  relatedSearches: [],
  knowledgePanel: null,
  ...overrides,
});

const panel = { title: "CRM", subtitle: null, description: null, facts: [] };

describe("mergeSearchPages", () => {
  it("numbers organic results across pages and keeps their page", () => {
    const merged = mergeSearchPages([
      page({ organicResults: [organic("a", 1), organic("b", 1)] }),
      page({ organicResults: [organic("c", 2)] }),
    ]);

    expect(
      merged.organicResults.map(({ position, title, page: number }) => [
        position,
        title,
        number,
      ]),
    ).toEqual([
      [1, "a", 1],
      [2, "b", 1],
      [3, "c", 2],
    ]);
  });

  it("keeps a result Google repeats on a later page", () => {
    const merged = mergeSearchPages([
      page({ organicResults: [organic("a", 1)] }),
      page({ organicResults: [organic("a", 2)] }),
    ]);

    expect(merged.organicResults).toHaveLength(2);
  });

  it("lists each question and related search once, in first-seen order", () => {
    const merged = mergeSearchPages([
      page({
        peopleAlsoAsk: [{ question: "one" }, { question: "two" }],
        relatedSearches: [{ query: "x" }],
      }),
      page({
        peopleAlsoAsk: [{ question: "two" }, { question: "three" }],
        relatedSearches: [{ query: "x" }, { query: "y" }],
      }),
    ]);

    expect(merged.peopleAlsoAsk).toEqual([
      { question: "one" },
      { question: "two" },
      { question: "three" },
    ]);
    expect(merged.relatedSearches).toEqual([{ query: "x" }, { query: "y" }]);
  });

  it("takes the knowledge panel from the first page that has one", () => {
    expect(
      mergeSearchPages([page({}), page({ knowledgePanel: panel })])
        .knowledgePanel,
    ).toEqual(panel);
    expect(mergeSearchPages([page({}), page({})]).knowledgePanel).toBeNull();
  });

  it("returns empty sections for no pages", () => {
    expect(mergeSearchPages([])).toEqual(page({}));
  });
});

describe("parseGoogleSearchPages", () => {
  const read = (suffix: string) =>
    readFileSync(
      resolve(
        import.meta.dirname,
        `../../fixtures/google/project-management-software${suffix}.html`,
      ),
      "utf8",
    );
  const merged = parseGoogleSearchPages([
    read(""),
    read(".page-2"),
    read(".page-3"),
  ]);

  it("parses three real pages into one continuous list", () => {
    expect(merged.organicResults).toHaveLength(28);
    expect(merged.organicResults.map(({ position }) => position)).toEqual(
      Array.from({ length: 28 }, (_, index) => index + 1),
    );
    expect(merged.organicResults.map((result) => result.page)).toEqual([
      ...Array(8).fill(1),
      ...Array(10).fill(2),
      ...Array(10).fill(3),
    ]);
  });

  it("resolves every link on every page to an external address", () => {
    for (const { link } of merged.organicResults) {
      expect(new URL(link).hostname).not.toMatch(/google\.com$/);
    }
  });

  it("starts each page with that page's first result", () => {
    expect(merged.organicResults[0]?.link).toBe(
      "https://www.wrike.com/project-management-guide/faq/what-are-project-management-tools/",
    );
    expect(merged.organicResults[8]?.link).toBe(
      "https://www.projectmanager.com/",
    );
    expect(merged.organicResults[18]?.link).toBe("https://buildertrend.com/");
  });

  it("keeps the first page's questions when later pages have none", () => {
    expect(merged.peopleAlsoAsk).toHaveLength(4);
    expect(merged.relatedSearches.length).toBeGreaterThanOrEqual(8);
  });
});
