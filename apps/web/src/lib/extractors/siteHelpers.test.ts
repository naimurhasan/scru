import { describe, expect, it } from "vitest";
import { countRecords } from "./countRecords";
import { isJsonCrawlOf } from "./isJsonCrawlOf";

describe("isJsonCrawlOf", () => {
  it("matches a JSON crawl of the host", () => {
    expect(
      isJsonCrawlOf(
        { url: "https://shop.example/c/1", output: "json" },
        "shop.example",
      ),
    ).toBe(true);
  });

  it.each([
    [{ url: "https://shop.example/", output: "markdown" }],
    [{ url: "https://other.example/", output: "json" }],
    [{ output: "json" }],
  ])("does not match %j", (payload) => {
    expect(isJsonCrawlOf(payload, "shop.example")).toBe(false);
  });
});

describe("countRecords", () => {
  it.each([
    [[{ a: "1" }, { a: "2" }], 2],
    [{ a: "1" }, 1],
    [null, 0],
  ])("counts %j as %i", (data, count) => {
    expect(countRecords(data)).toBe(count);
  });
});
