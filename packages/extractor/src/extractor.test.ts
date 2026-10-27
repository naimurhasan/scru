import { describe, expect, it } from "vitest";
import { groupUrlsByPattern, matchesUrlPattern } from "./urlPatterns.ts";

const site = "https://books.toscrape.com";

describe("groupUrlsByPattern", () => {
  it("groups pages that share a shape, largest group first", () => {
    const groups = groupUrlsByPattern([
      `${site}/`,
      `${site}/catalogue/a-light-in-the-attic_1000/index.html`,
      `${site}/catalogue/tipping-the-velvet_999/index.html`,
      `${site}/catalogue/soumission_998/index.html`,
      `${site}/catalogue/category/books/travel_2/index.html`,
      `${site}/catalogue/category/books/mystery_3/index.html`,
      `${site}/catalogue/page-2.html`,
    ]);

    expect(groups.map(({ pattern, urls }) => [pattern, urls.length])).toEqual([
      ["/catalogue/*/index.html", 3],
      ["/catalogue/category/books/*/index.html", 2],
      ["/", 1],
      ["/catalogue/*", 1],
    ]);
  });

  it("merges pages that differ only in their last segment", () => {
    const groups = groupUrlsByPattern([
      "https://quotes.example/author/Albert-Einstein",
      "https://quotes.example/author/Jane-Austen",
      "https://quotes.example/about",
    ]);

    expect(groups.map(({ pattern }) => pattern)).toEqual([
      "/author/*",
      "/about",
    ]);
  });
});

describe("matchesUrlPattern", () => {
  it.each([
    ["/catalogue/*/index.html", "/catalogue/soumission_998/index.html", true],
    [
      "/catalogue/*/index.html",
      "/catalogue/category/books/travel_2/index.html",
      false,
    ],
    ["/author/*", "/author/Jane-Austen?page=2", true],
    ["/", "/", true],
    ["/", "/about", false],
  ])("%s against %s", (pattern, path, matches) => {
    expect(matchesUrlPattern(pattern, `https://site.example${path}`)).toBe(
      matches,
    );
  });
});
