import { calculatePreparationCredits } from "../credits/calculatePreparationCredits.ts";
import type { TaskSettlement } from "../tasks/types.ts";
import type { ExtractorOutcome } from "./types.ts";

const BAD_GATEWAY = 502;

export const toExtractorSettlement = (
  outcome: ExtractorOutcome,
): TaskSettlement => {
  if (outcome.extractorId === null)
    return {
      ok: false,
      errorCode: "PREPARATION_FAILED",
      errorMessage:
        outcome.pagesFetched === 0
          ? "No page of the site could be fetched"
          : "No reliable fields could be found on the sample pages",
      httpStatus: BAD_GATEWAY,
    };
  const {
    creditsPerPage: _creditsPerPage,
    modelCalls: _modelCalls,
    ...result
  } = outcome;
  return {
    ok: true,
    result,
    loggedResult: result,
    cost: calculatePreparationCredits(
      outcome.pagesFetched,
      outcome.creditsPerPage,
    ),
  };
};
