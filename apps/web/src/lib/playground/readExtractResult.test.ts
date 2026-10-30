import { describe, expect, it } from "vitest";
import { readExtractResult } from "./readExtractResult";

const result = {
  url: "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html",
  statusCode: 200,
  extractor: { id: "e1", version: 2 },
  pageType: "book_listing",
  data: [{ title: "Sharp Objects", price: "£47.82" }],
};

describe("readExtractResult", () => {
  it("reads a successful extraction", () => {
    expect(readExtractResult({ success: true, result })).toMatchObject({
      pageType: "book_listing",
      data: result.data,
    });
  });

  it("reads a single record", () => {
    expect(
      readExtractResult({
        success: true,
        result: { ...result, data: { title: null } },
      })?.data,
    ).toEqual({ title: null });
  });

  it("returns null for an error body", () => {
    expect(
      readExtractResult({ success: false, error: { code: "NOT_FOUND" } }),
    ).toBeNull();
  });
});
