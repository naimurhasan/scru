import type { PageType } from "@scru/parser";
import { describe, expect, it } from "vitest";
import { extractPage, findPageType } from "./extractPage.ts";

const detail: PageType = {
  name: "book_detail",
  pattern: "/catalogue/*/index.html",
  itemSelector: null,
  fillRate: 1,
  fields: [
    { name: "title", description: "", selector: "h1", attribute: null },
    { name: "image", description: "", selector: "img", attribute: "src" },
  ],
};

const html = '<h1>Sharp Objects</h1><img src="../../media/a.jpg">';

describe("extractPage", () => {
  it("extracts a page with the page type its address matches", () => {
    expect(
      extractPage(
        [detail],
        html,
        "https://books.toscrape.com/catalogue/sharp-objects_997/index.html",
      ),
    ).toEqual({
      pageType: "book_detail",
      data: {
        title: "Sharp Objects",
        image: "https://books.toscrape.com/media/a.jpg",
      },
    });
  });

  it("falls back to the page type that fills best when no address matches", () => {
    expect(
      extractPage([detail], html, "https://books.toscrape.com/featured/a/b"),
    ).toMatchObject({
      pageType: "book_detail",
      data: { title: "Sharp Objects" },
    });
  });

  it("returns null when no page type fills the page", () => {
    expect(
      extractPage(
        [detail],
        "<p>Sign in</p>",
        "https://books.toscrape.com/login",
      ),
    ).toBeNull();
  });
});

describe("findPageType", () => {
  it("finds no page type in an empty extractor", () => {
    expect(findPageType([], "https://a.com/x")).toBeNull();
  });
});
