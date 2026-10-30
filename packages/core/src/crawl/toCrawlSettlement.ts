import type { TaskSettlement } from "../tasks/types.ts";
import type { CrawlOutcome } from "./types.ts";

const BAD_GATEWAY = 502;

const failure = (errorCode: string, errorMessage: string): TaskSettlement => ({
  ok: false,
  errorCode,
  errorMessage,
  httpStatus: BAD_GATEWAY,
});

export const toCrawlSettlement = (outcome: CrawlOutcome): TaskSettlement => {
  if (outcome.stoppedBy === "no_extractor")
    return failure(
      "PREPARATION_FAILED",
      "No reliable fields could be found for this site",
    );
  if (outcome.pagesFetched === 0)
    return failure("FETCH_FAILED", "No page of the site could be fetched");
  const {
    creditsPerPage: _creditsPerPage,
    preparationCredits: _preparationCredits,
    ...summary
  } = outcome;
  return {
    ok: true,
    result: summary,
    loggedResult: summary,
    cost:
      outcome.pagesFetched * outcome.creditsPerPage +
      outcome.preparationCredits,
  };
};
