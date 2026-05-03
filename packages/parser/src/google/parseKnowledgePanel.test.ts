import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseGoogleSearch } from "./parseGoogleSearch.ts";

const readFixture = (name: string) =>
  readFileSync(
    resolve(import.meta.dirname, `../../fixtures/google/${name}.html`),
    "utf8",
  );

describe("knowledge panel", () => {
  const result = parseGoogleSearch(readFixture("albert-einstein"));

  it("extracts the title, subtitle and description", () => {
    expect(result.knowledgePanel?.title).toBe("Albert Einstein");
    expect(result.knowledgePanel?.subtitle).toBe("Theoretical physicist");
    expect(result.knowledgePanel?.description).toMatch(
      /^Albert Einstein was a German-born theoretical physicist/,
    );
    expect(result.knowledgePanel?.description).not.toMatch(/Wikipedia$/);
  });

  it("extracts facts as label and value pairs", () => {
    expect(result.knowledgePanel?.facts).toContainEqual({
      label: "Born",
      value: "March 14, 1879, Ulm, Germany",
    });
    expect(result.knowledgePanel?.facts).toContainEqual({
      label: "Education",
      value: "University of Zurich (1905), ETH Zürich (1897–1900)",
    });
  });

  it("still extracts the other sections on the same page", () => {
    expect(result.organicResults[0]?.link).toBe(
      "https://en.wikipedia.org/wiki/Albert_Einstein",
    );
    expect(result.organicResults).toHaveLength(8);
    expect(result.peopleAlsoAsk).toHaveLength(4);
    expect(result.relatedSearches).toHaveLength(8);
  });

  it("is null when the page has no panel", () => {
    const page = parseGoogleSearch(
      readFixture("best-crm-tools-for-small-businesses"),
    );
    expect(page.knowledgePanel).toBeNull();
  });
});
