import type { TaskSettlement } from "../tasks/types.ts";
import type { CrawlOutcome } from "./types.ts";

const BAD_GATEWAY = 502;

export const toCrawlSettlement = (outcome: CrawlOutcome): TaskSettlement => {
  if (outcome.pagesFetched === 0)
    return {
      ok: false,
      errorCode: "FETCH_FAILED",
      errorMessage: "No page of the site could be fetched",
      httpStatus: BAD_GATEWAY,
    };
  const { creditsPerPage: _creditsPerPage, ...summary } = outcome;
  return {
    ok: true,
    result: summary,
    loggedResult: summary,
    cost: outcome.pagesFetched * outcome.creditsPerPage,
  };
};
