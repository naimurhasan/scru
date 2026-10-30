import { describe, expect, it } from "vitest";
import { toCrawlSettlement } from "./toCrawlSettlement.ts";
import type { CrawlOutcome } from "./types.ts";

const outcome: CrawlOutcome = {
  pagesFetched: 12,
  pagesFailed: 1,
  pagesQueued: 40,
  creditsPerPage: 5,
  stoppedBy: "limit",
  extractor: null,
  preparationCredits: 0,
};

const summary = {
  pagesFetched: 12,
  pagesFailed: 1,
  pagesQueued: 40,
  stoppedBy: "limit",
  extractor: null,
};

describe("toCrawlSettlement", () => {
  it("charges every fetched page and reports the summary", () => {
    expect(toCrawlSettlement(outcome)).toEqual({
      ok: true,
      result: summary,
      loggedResult: summary,
      cost: 60,
    });
  });

  it("adds the cost of preparing the site's extractor", () => {
    expect(
      toCrawlSettlement({
        ...outcome,
        extractor: { id: "e1", version: 1, prepared: true },
        preparationCredits: 31,
      }),
    ).toMatchObject({
      ok: true,
      result: { extractor: { id: "e1", version: 1, prepared: true } },
      cost: 91,
    });
  });

  it("fails without charging when no page came back", () => {
    expect(
      toCrawlSettlement({ ...outcome, pagesFetched: 0, pagesFailed: 1 }),
    ).toMatchObject({ ok: false, errorCode: "FETCH_FAILED" });
  });

  it("fails without charging when the site has no extractor", () => {
    expect(
      toCrawlSettlement({
        ...outcome,
        pagesFetched: 0,
        stoppedBy: "no_extractor",
        preparationCredits: 31,
      }),
    ).toMatchObject({ ok: false, errorCode: "PREPARATION_FAILED" });
  });
});
