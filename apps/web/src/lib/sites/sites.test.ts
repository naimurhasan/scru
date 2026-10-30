import { describe, expect, it } from "vitest";
import { countBatchUrls } from "./countBatchUrls";
import { describePageResult } from "./describePageResult";
import { describeSiteTask } from "./describeSiteTask";
import { parseUrlList } from "./parseUrlList";

describe("describePageResult", () => {
  it("names the failure", () => {
    expect(
      describePageResult({ error: "blocked", pageType: null, content: null }),
    ).toBe("Blocked");
  });

  it("names the page type of a JSON page", () => {
    expect(
      describePageResult({ error: null, pageType: "product", content: null }),
    ).toBe("product");
  });

  it("gives the size of converted content", () => {
    expect(
      describePageResult({
        error: null,
        pageType: null,
        content: "x".repeat(1200),
      }),
    ).toBe("1,200 characters");
  });
});

describe("describeSiteTask", () => {
  it("counts a batch's addresses", () => {
    expect(describeSiteTask({ urls: ["a", "b"] })).toBe("2 addresses");
  });

  it("shows a crawl's start page", () => {
    expect(describeSiteTask({ url: "https://a.example/" })).toBe(
      "https://a.example/",
    );
  });
});

describe("parseUrlList", () => {
  it("splits on whitespace, drops blanks and duplicates", () => {
    expect(
      parseUrlList(
        " https://a.example/\n\nhttps://b.example/ https://a.example/ ",
      ),
    ).toEqual(["https://a.example/", "https://b.example/"]);
  });
});

describe("countBatchUrls", () => {
  it("counts a batch's addresses and ignores other payloads", () => {
    expect(countBatchUrls({ urls: ["a", "b", "c"] })).toBe(3);
    expect(countBatchUrls({ url: "a" })).toBe(0);
  });
});
