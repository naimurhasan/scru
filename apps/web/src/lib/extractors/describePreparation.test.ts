import { describe, expect, it } from "vitest";
import { describePreparation } from "./describePreparation";

describe("describePreparation", () => {
  it("reads the address and the saved version", () => {
    expect(
      describePreparation({
        payload: { url: "https://books.toscrape.com/" },
        result: {
          extractorId: "e1",
          version: 2,
          pageTypes: [{ name: "book_listing" }, { name: "book_detail" }],
        },
      }),
    ).toEqual({
      url: "https://books.toscrape.com/",
      summary: "Version 2, 2 page types",
      extractorId: "e1",
    });
  });

  it("has no summary before the task finishes", () => {
    expect(
      describePreparation({ payload: { url: "https://a.com/" }, result: null }),
    ).toEqual({ url: "https://a.com/", summary: null, extractorId: null });
  });

  it("uses the singular for one page type", () => {
    expect(
      describePreparation({
        payload: {},
        result: { extractorId: "e1", version: 1, pageTypes: [{ name: "a" }] },
      }).summary,
    ).toBe("Version 1, 1 page type");
  });
});
