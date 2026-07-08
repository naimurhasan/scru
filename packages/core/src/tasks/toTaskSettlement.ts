import { calculateCredits } from "../credits/calculateCredits.ts";
import type { SearchOutcome } from "../search/types.ts";
import type { TaskSettlement } from "./types.ts";

const BAD_GATEWAY = 502;

export const toTaskSettlement = (outcome: SearchOutcome): TaskSettlement =>
  outcome.ok
    ? {
        ok: true,
        result:
          outcome.html === null
            ? outcome.result
            : { ...outcome.result, html: outcome.html },
        loggedResult: outcome.result,
        cost: calculateCredits({ pages: 1, mode: "async" }),
      }
    : {
        ok: false,
        errorCode: "FETCH_FAILED",
        errorMessage: `Google could not be fetched (${outcome.reason})`,
        httpStatus: BAD_GATEWAY,
      };
