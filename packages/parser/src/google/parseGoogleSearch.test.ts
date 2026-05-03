import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseGoogleSearch } from "./parseGoogleSearch.ts";

const html = readFileSync(
  resolve(
    import.meta.dirname,
    "../../fixtures/google/best-crm-tools-for-small-businesses.html",
  ),
  "utf8",
);

describe("parseGoogleSearch", () => {
  const result = parseGoogleSearch(html);

  it("extracts every organic result in order", () => {
    expect(result.organicResults.map(({ position }) => position)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(result.organicResults[0]).toEqual({
      position: 1,
      title: "Best CRM Software for Small Business in 2026",
      link: "https://crm.org/crmland/best-crm-for-small-business",
      snippet:
        "Jun 19, 2026 — CRMs like HubSpot and Zoho Bigin are designed for small teams that want to get moving in under 30 minutes. They guide you through setup, sync ...",
      page: 1,
    });
  });

  it("gives every organic result a title, an external link and a snippet", () => {
    for (const { title, link, snippet } of result.organicResults) {
      expect(title).not.toBe("");
      expect(snippet).not.toBe("");
      expect(new URL(link).hostname).not.toMatch(/google\.com$/);
    }
  });

  it("drops the link text Google appends to snippets", () => {
    for (const { snippet } of result.organicResults) {
      expect(snippet).not.toMatch(/Read more$/);
    }
  });

  it("stamps the requested page number", () => {
    expect(parseGoogleSearch(html, 3).organicResults[0]?.page).toBe(3);
  });

  it("extracts People Also Ask questions", () => {
    expect(result.peopleAlsoAsk).toEqual([
      { question: "What is the best CRM software for small businesses?" },
      { question: "What are the top 3 CRM tools?" },
      { question: "Can ChatGPT make a CRM?" },
      { question: "Will CRM be replaced by AI?" },
    ]);
  });

  it("extracts unique related searches", () => {
    const queries = result.relatedSearches.map(({ query }) => query);
    expect(queries).toHaveLength(8);
    expect(new Set(queries).size).toBe(8);
    expect(queries).toContain("Simple CRM for small business");
  });

  it("returns empty sections for a page without results", () => {
    expect(parseGoogleSearch("<html><body></body></html>")).toEqual({
      organicResults: [],
      peopleAlsoAsk: [],
      relatedSearches: [],
      knowledgePanel: null,
    });
  });
});
