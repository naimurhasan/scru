import { calculateFetchCredits, type PageFailureReason } from "@scru/core";
import type { RequestActor } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { insufficientCredits } from "../requests/insufficientCredits.ts";
import type { Execution } from "../requests/types.ts";
import type { FetchRequest, FetchResponse } from "./schemas.ts";
import { toFetchJob } from "./toFetchJob.ts";
import { toFetchResult } from "./toFetchResult.ts";

const toFetchError = (reason: PageFailureReason) =>
  reason === "timeout"
    ? new ApiError("TIMEOUT", "The page did not load in time", { reason })
    : new ApiError("FETCH_FAILED", "The page could not be fetched", {
        reason,
      });

const PROXIES_UNAVAILABLE = new ApiError(
  "VALIDATION_ERROR",
  "The request is invalid",
  [{ field: "premiumProxy", message: "Premium proxies are not available" }],
);

export const executeFetch = async (
  deps: Pick<ApiDeps, "fetchPage" | "chargeCredits">,
  config: Pick<ApiConfig, "proxiesEnabled">,
  actor: RequestActor,
  request: FetchRequest,
): Promise<Execution<FetchResponse>> => {
  if (request.premiumProxy && !config.proxiesEnabled)
    return { ok: false, error: PROXIES_UNAVAILABLE };
  const job = toFetchJob(request);
  const cost = calculateFetchCredits({
    jsRender: job.jsRender,
    premiumProxy: job.proxy !== null,
  });
  if (actor.credits < cost) return insufficientCredits(cost);

  const outcome = await deps.fetchPage(job);
  if (!outcome.ok) return { ok: false, error: toFetchError(outcome.reason) };

  const creditsRemaining = await deps.chargeCredits(actor.workspaceId, cost);
  if (creditsRemaining === null) return insufficientCredits(cost);

  return {
    ok: true,
    body: { success: true, result: toFetchResult(outcome.page, request) },
    creditsCharged: cost,
    creditsRemaining,
  };
};
