import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { detectBlock } from "./detectBlock.ts";

const blockedHtml = readFileSync(
  resolve(import.meta.dirname, "../../fixtures/google/blocked-sorry.html"),
  "utf8",
);
const resultsHtml = '<html><body><div id="search"></div></body></html>';
const searchUrl = "https://www.google.com/search?q=crm";

describe("detectBlock", () => {
  it("passes a results page", () => {
    expect(
      detectBlock({ url: searchUrl, status: 200, html: resultsHtml }),
    ).toBeNull();
  });

  it("flags Google's captcha page by its markup", () => {
    expect(
      detectBlock({ url: searchUrl, status: 200, html: blockedHtml }),
    ).toBe("captcha");
  });

  it("flags a redirect to the sorry page", () => {
    const url = "https://www.google.com/sorry/index?continue=x";
    expect(detectBlock({ url, status: 200, html: "" })).toBe("captcha");
  });

  it("flags an error status", () => {
    expect(
      detectBlock({ url: searchUrl, status: 429, html: resultsHtml }),
    ).toBe("http_error");
  });

  it("flags a page without a results container", () => {
    expect(
      detectBlock({ url: searchUrl, status: 200, html: "<html></html>" }),
    ).toBe("unexpected_page");
  });
});
