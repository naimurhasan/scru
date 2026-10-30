import { describe, expect, it } from "vitest";
import { toBatchSettlement } from "./toBatchSettlement.ts";

describe("toBatchSettlement", () => {
  it("charges fetched pages and preparation", () => {
    expect(
      toBatchSettlement({
        pagesFetched: 3,
        pagesFailed: 1,
        creditsPerPage: 5,
        preparationCredits: 20,
      }),
    ).toEqual({
      ok: true,
      result: { pagesFetched: 3, pagesFailed: 1 },
      loggedResult: { pagesFetched: 3, pagesFailed: 1 },
      cost: 35,
    });
  });

  it("fails without charging when no page was fetched", () => {
    expect(
      toBatchSettlement({
        pagesFetched: 0,
        pagesFailed: 4,
        creditsPerPage: 1,
        preparationCredits: 20,
      }),
    ).toMatchObject({ ok: false, errorCode: "FETCH_FAILED" });
  });
});
