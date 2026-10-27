import { calculateCredits } from "@scru/core";
import type { RequestActor } from "@scru/db";
import type { ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { insufficientCredits } from "../requests/insufficientCredits.ts";
import type { Execution } from "../requests/types.ts";
import type { GoogleSearchRequest, GoogleSearchResponse } from "./schemas.ts";
import { toSearchJob } from "./toSearchJob.ts";

export const executeGoogleSearch = async (
  deps: Pick<ApiDeps, "searchGoogle" | "chargeCredits">,
  actor: RequestActor,
  request: GoogleSearchRequest,
): Promise<Execution<GoogleSearchResponse>> => {
  const estimate = calculateCredits({ pages: request.pages, mode: "sync" });
  if (actor.credits < estimate) return insufficientCredits(estimate);

  const outcome = await deps.searchGoogle(toSearchJob(request, null));
  if (!outcome.ok) {
    const timedOut = outcome.reason === "timeout";
    return {
      ok: false,
      error: new ApiError(
        timedOut ? "TIMEOUT" : "FETCH_FAILED",
        timedOut
          ? "The search did not finish in time"
          : "Google could not be fetched",
        { reason: outcome.reason },
      ),
    };
  }

  const cost = calculateCredits({ pages: outcome.pages, mode: "sync" });
  const creditsRemaining = await deps.chargeCredits(actor.workspaceId, cost);
  if (creditsRemaining === null) return insufficientCredits(cost);

  return {
    ok: true,
    body: {
      success: true,
      result: {
        ...outcome.result,
        ...(request.include.html &&
          outcome.html !== null && { html: outcome.html }),
      },
    },
    creditsCharged: cost,
    creditsRemaining,
  };
};
