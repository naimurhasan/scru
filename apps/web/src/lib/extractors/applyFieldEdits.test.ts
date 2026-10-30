import { describe, expect, it } from "vitest";
import { applyFieldEdits } from "./applyFieldEdits";
import type { ExtractorField, PageType } from "./types";

const field = (name: string, selector = "h1"): ExtractorField => ({
  name,
  description: "",
  selector,
  attribute: null,
});

const pageType: PageType = {
  name: "book_detail",
  pattern: "/catalogue/*/index.html",
  itemSelector: null,
  fillRate: 1,
  fields: [field("title")],
};

describe("applyFieldEdits", () => {
  it("replaces each page type's fields with the cleaned edits", () => {
    expect(
      applyFieldEdits(
        [pageType],
        [[{ ...field(" Book Title ", " h1 "), attribute: " " }]],
      ),
    ).toEqual({
      ok: true,
      pageTypes: [{ ...pageType, fields: [field("book_title")] }],
    });
  });

  it("keeps an attribute that has a value", () => {
    const result = applyFieldEdits(
      [pageType],
      [[{ ...field("image", "img"), attribute: " src " }]],
    );
    expect(result.ok && result.pageTypes[0]?.fields[0]?.attribute).toBe("src");
  });

  it("rejects a page type left without fields", () => {
    expect(applyFieldEdits([pageType], [[]]).ok).toBe(false);
  });

  it("rejects duplicate field names", () => {
    expect(
      applyFieldEdits([pageType], [[field("title"), field("Title")]]).ok,
    ).toBe(false);
  });

  it("rejects an empty field name", () => {
    expect(applyFieldEdits([pageType], [[field("  ")]]).ok).toBe(false);
  });

  it("rejects edits for a different number of page types", () => {
    expect(applyFieldEdits([pageType], []).ok).toBe(false);
  });
});
