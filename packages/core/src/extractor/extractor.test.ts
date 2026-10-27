import { describe, expect, it } from "vitest";
import { toExtractorSettlement } from "./toExtractorSettlement.ts";
import type { ExtractorOutcome } from "./types.ts";

const outcome: ExtractorOutcome = {
  extractorId: "extractor-1",
  version: 2,
  pageTypes: [
    {
      name: "product_detail",
      pattern: "/catalogue/*/index.html",
      fillRate: 1,
      fields: ["title", "price"],
    },
  ],
  pagesFetched: 15,
  modelCalls: 2,
  creditsPerPage: 1,
};

describe("toExtractorSettlement", () => {
  it("charges the sample pages plus the preparation", () => {
    expect(toExtractorSettlement(outcome)).toMatchObject({
      ok: true,
      cost: 35,
      result: {
        extractorId: "extractor-1",
        version: 2,
        pagesFetched: 15,
        pageTypes: outcome.pageTypes,
      },
    });
  });

  it("fails without charging when no extractor could be saved", () => {
    expect(
      toExtractorSettlement({ ...outcome, extractorId: null, version: null }),
    ).toMatchObject({
      ok: false,
      errorCode: "PREPARATION_FAILED",
      errorMessage: "No reliable fields could be found on the sample pages",
    });
    expect(
      toExtractorSettlement({
        ...outcome,
        extractorId: null,
        version: null,
        pagesFetched: 0,
      }),
    ).toMatchObject({ errorMessage: "No page of the site could be fetched" });
  });
});
