import { calculateCredits } from "@scru/core";
import type { ActiveApiKey } from "@scru/db";
import type { ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import type { GoogleSearchRequest, GoogleSearchResponse } from "./schemas.ts";

const LANGUAGE = "en";

export type GoogleSearchExecution =
  | {
      ok: true;
      body: GoogleSearchResponse;
      creditsCharged: number;
      creditsRemaining: number;
    }
  | { ok: false; error: ApiError };

const insufficientCredits = (cost: number): GoogleSearchExecution => ({
  ok: false,
  error: new ApiError(
    "INSUFFICIENT_CREDITS",
    "Not enough credits for this request",
    { required: cost },
  ),
});

export const executeGoogleSearch = async (
  deps: Pick<ApiDeps, "searchGoogle" | "chargeCredits">,
  apiKey: ActiveApiKey,
  request: GoogleSearchRequest,
): Promise<GoogleSearchExecution> => {
  const cost = calculateCredits({ pages: 1, mode: "sync" });
  if (apiKey.credits < cost) return insufficientCredits(cost);

  const outcome = await deps.searchGoogle({
    query: request.query,
    country: request.country,
    language: LANGUAGE,
    includeHtml: request.include.html,
  });
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

  const creditsRemaining = await deps.chargeCredits(apiKey.workspaceId, cost);
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
