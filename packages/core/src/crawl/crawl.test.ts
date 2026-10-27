import { describe, expect, it } from "vitest";
import { toCrawlSettlement } from "./toCrawlSettlement.ts";
import type { CrawlOutcome } from "./types.ts";

const outcome: CrawlOutcome = {
  pagesFetched: 12,
  pagesFailed: 1,
  pagesQueued: 40,
  creditsPerPage: 5,
  stoppedBy: "limit",
};

describe("toCrawlSettlement", () => {
  it("charges every fetched page and reports the summary", () => {
    expect(toCrawlSettlement(outcome)).toEqual({
      ok: true,
      result: {
        pagesFetched: 12,
        pagesFailed: 1,
        pagesQueued: 40,
        stoppedBy: "limit",
      },
      loggedResult: {
        pagesFetched: 12,
        pagesFailed: 1,
        pagesQueued: 40,
        stoppedBy: "limit",
      },
      cost: 60,
    });
  });

  it("fails without charging when no page came back", () => {
    expect(
      toCrawlSettlement({ ...outcome, pagesFetched: 0, pagesFailed: 1 }),
    ).toMatchObject({ ok: false, errorCode: "FETCH_FAILED" });
  });
});
