import { describe, expect, it } from "vitest";
import { convertHtml } from "./convertHtml.ts";
import { extractLinks } from "./extractLinks.ts";

describe("extractLinks", () => {
  it("resolves links against the page and drops fragments and repeats", () => {
    const html = `
      <a href="/catalogue/page-2.html">next</a>
      <a href="book-1.html#reviews">book</a>
      <a href="book-1.html">book again</a>
      <a href="https://other.example/x">other site</a>`;

    expect(extractLinks(html, "https://shop.example/catalogue/")).toEqual([
      "https://shop.example/catalogue/page-2.html",
      "https://shop.example/catalogue/book-1.html",
      "https://other.example/x",
    ]);
  });

  it("skips mail, phone, script and empty links", () => {
    const html = `
      <a href="mailto:a@b.c">mail</a>
      <a href="tel:123">call</a>
      <a href="javascript:void(0)">js</a>
      <a>no href</a>`;

    expect(extractLinks(html, "https://shop.example/")).toEqual([]);
  });

  it("follows the page's base address", () => {
    const html = `<base href="https://cdn.example/docs/"><a href="intro">x</a>`;

    expect(extractLinks(html, "https://shop.example/")).toEqual([
      "https://cdn.example/docs/intro",
    ]);
  });
});

describe("convertHtml", () => {
  const html = "<h1>Deals</h1><p>Today only</p>";

  it.each([
    ["html", html],
    ["markdown", "# Deals\n\nToday only"],
    ["text", "Deals Today only"],
  ] as const)("converts to %s", (output, expected) => {
    expect(convertHtml(html, output)).toBe(expected);
  });
});
