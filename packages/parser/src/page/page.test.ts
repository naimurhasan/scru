import { describe, expect, it } from "vitest";
import { extractWithCss } from "./extractWithCss.ts";
import {
  isValidExtractorRule,
  readExtractorRule,
} from "./readExtractorRule.ts";
import { toMarkdown } from "./toMarkdown.ts";
import { toText } from "./toText.ts";

const html = `<html>
  <head><title>Shop</title><style>h1 { color: red }</style></head>
  <body>
    <script>window.track = 1</script>
    <h1>Daily deals</h1>
    <ul>
      <li class="item"><a href="/p/1">Red   chair</a> <span class="price">$40</span></li>
      <li class="item"><a href="/p/2">Blue table</a> <span class="price">$90</span></li>
    </ul>
    <p class="note">Prices include tax.</p>
  </body>
</html>`;

describe("toMarkdown", () => {
  it("keeps headings, lists and links and drops scripts and styles", () => {
    const markdown = toMarkdown(html);

    expect(markdown).toContain("# Daily deals");
    expect(markdown).toContain("[Red chair](/p/1)");
    expect(markdown).not.toContain("window.track");
    expect(markdown).not.toContain("color: red");
  });
});

describe("toText", () => {
  it("returns the visible text on one line", () => {
    expect(toText(html)).toBe(
      "Daily deals Red chair $40 Blue table $90 Prices include tax.",
    );
  });
});

describe("readExtractorRule", () => {
  it("reads a plain selector", () => {
    expect(readExtractorRule("h1")).toEqual({
      selector: "h1",
      attribute: null,
    });
  });

  it("reads an attribute after @", () => {
    expect(readExtractorRule(".item a @href")).toEqual({
      selector: ".item a",
      attribute: "href",
    });
  });
});

describe("isValidExtractorRule", () => {
  it("accepts valid selectors", () => {
    expect(isValidExtractorRule("ul > li.item a @href")).toBe(true);
  });

  it.each(["", "@href", "li[", "::nope("])("rejects %j", (rule) => {
    expect(isValidExtractorRule(rule)).toBe(false);
  });
});

describe("extractWithCss", () => {
  it("returns a string for one match and a list for several", () => {
    expect(
      extractWithCss(html, {
        title: "h1",
        names: ".item a",
        links: ".item a @href",
        note: ".note",
      }),
    ).toEqual({
      title: "Daily deals",
      names: ["Red chair", "Blue table"],
      links: ["/p/1", "/p/2"],
      note: "Prices include tax.",
    });
  });

  it("returns an empty list when nothing matches", () => {
    expect(extractWithCss(html, { missing: ".nothing" })).toEqual({
      missing: [],
    });
  });
});
