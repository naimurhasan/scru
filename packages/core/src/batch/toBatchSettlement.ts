import type { TaskSettlement } from "../tasks/types.ts";
import type { BatchOutcome } from "./types.ts";

const BAD_GATEWAY = 502;

export const toBatchSettlement = (outcome: BatchOutcome): TaskSettlement => {
  if (outcome.pagesFetched === 0)
    return {
      ok: false,
      errorCode: "FETCH_FAILED",
      errorMessage: "None of the pages could be fetched",
      httpStatus: BAD_GATEWAY,
    };
  const summary = {
    pagesFetched: outcome.pagesFetched,
    pagesFailed: outcome.pagesFailed,
  };
  return {
    ok: true,
    result: summary,
    loggedResult: summary,
    cost:
      outcome.pagesFetched * outcome.creditsPerPage +
      outcome.preparationCredits,
  };
};
