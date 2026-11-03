import { describe, expect, it } from "vitest";
import { pickPageGroups } from "./pickPageGroups.ts";
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

  it("merges pages that differ in any one segment, like a product name before its id", () => {
    const groups = groupUrlsByPattern([
      "https://shop.example/Wireless-Mouse/dp/B004YAVF8I",
      "https://shop.example/Gaming-Mouse/dp/B07GBZ4Q68",
      "https://shop.example/Mouse-M185/dp/B0CFH1Z6TQ",
    ]);

    expect(groups.map(({ pattern, urls }) => [pattern, urls.length])).toEqual([
      ["/*/dp/*", 3],
    ]);
  });

  it("keeps a page that repeats with different queries as its own group", () => {
    const groups = groupUrlsByPattern([
      "https://shop.example/s?k=mouse",
      "https://shop.example/s?k=mouse&page=2",
      "https://shop.example/deals",
      "https://shop.example/coupons",
    ]);

    expect(groups.map(({ pattern, urls }) => [pattern, urls.length])).toEqual([
      ["/s", 2],
      ["/*", 2],
    ]);
  });

  it("keeps the pasted page as its own group even when it appears once", () => {
    const groups = groupUrlsByPattern(
      [
        "https://shop.example/search?q=mouse",
        "https://shop.example/deals",
        "https://shop.example/coupons",
      ],
      "https://shop.example/search?q=mouse",
    );

    expect(groups.map(({ pattern, urls }) => [pattern, urls.length])).toEqual([
      ["/*", 2],
      ["/search", 1],
    ]);
  });
});

describe("pickPageGroups", () => {
  const group = (pattern: string, size: number) => ({
    pattern,
    urls: Array.from({ length: size }, (_, index) => `${pattern}#${index}`),
  });

  it("always keeps the start page's group first, even when it is small", () => {
    const groups = [group("/a", 9), group("/b", 8), group("/c", 7)];
    const start = group("/s", 1);

    expect(
      pickPageGroups([...groups, start], start.urls[0]).map(
        ({ pattern }) => pattern,
      ),
    ).toEqual(["/s", "/a", "/b"]);
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
