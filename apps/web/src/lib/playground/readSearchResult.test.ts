import { describe, expect, it } from "vitest";
import { readSearchResult } from "./readSearchResult";

const result = {
  organicResults: [
    {
      position: 1,
      title: "Best CRM",
      link: "https://crm.org/best",
      snippet: "A guide",
      page: 1,
    },
  ],
  peopleAlsoAsk: [{ question: "What is a CRM?" }],
  relatedSearches: [{ query: "free crm" }],
  knowledgePanel: null,
};

describe("readSearchResult", () => {
  it("reads the result of a successful response", () => {
    expect(
      readSearchResult({ success: true, result })?.organicResults[0]?.title,
    ).toBe("Best CRM");
  });

  it("returns null for an error response", () => {
    expect(
      readSearchResult({ success: false, error: { code: "FETCH_FAILED" } }),
    ).toBeNull();
  });

  it("returns null for anything that is not a search response", () => {
    expect(readSearchResult(null)).toBeNull();
    expect(readSearchResult({ success: true, result: {} })).toBeNull();
  });
});
