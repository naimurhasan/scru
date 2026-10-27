import { calculateFetchCredits, type PageFailureReason } from "@scru/core";
import type { RequestActor } from "@scru/db";
import { matchesUrlPattern } from "@scru/extractor";
import { extractPageType } from "@scru/parser";
import type { ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { insufficientCredits } from "../requests/insufficientCredits.ts";
import type { Execution } from "../requests/types.ts";
import type { ExtractRequest, ExtractResponse } from "./schemas.ts";

const toFetchError = (reason: PageFailureReason) =>
  reason === "timeout"
    ? new ApiError("TIMEOUT", "The page did not load in time", { reason })
    : new ApiError("FETCH_FAILED", "The page could not be fetched", { reason });

export const executeExtract = async (
  deps: Pick<ApiDeps, "findLatestExtractor" | "fetchPage" | "chargeCredits">,
  actor: RequestActor,
  { url }: ExtractRequest,
): Promise<Execution<ExtractResponse>> => {
  const extractor = await deps.findLatestExtractor(
    actor.workspaceId,
    new URL(url).hostname,
  );
  if (!extractor)
    return {
      ok: false,
      error: new ApiError(
        "NOT_FOUND",
        "No extractor for this site yet. Prepare one with POST /v1/extractors.",
      ),
    };
  const pageType = extractor.pageTypes.find(({ pattern }) =>
    matchesUrlPattern(pattern, url),
  );
  if (!pageType)
    return {
      ok: false,
      error: new ApiError(
        "NOT_FOUND",
        "The site's extractor has no page type for this address",
        { patterns: extractor.pageTypes.map(({ pattern }) => pattern) },
      ),
    };

  const cost = calculateFetchCredits({
    jsRender: extractor.fetchOptions.jsRender,
    premiumProxy: extractor.fetchOptions.proxy !== null,
  });
  if (actor.credits < cost) return insufficientCredits(cost);

  const outcome = await deps.fetchPage({ ...extractor.fetchOptions, url });
  if (!outcome.ok) return { ok: false, error: toFetchError(outcome.reason) };

  const creditsRemaining = await deps.chargeCredits(actor.workspaceId, cost);
  if (creditsRemaining === null) return insufficientCredits(cost);

  return {
    ok: true,
    body: {
      success: true,
      result: {
        url: outcome.page.url,
        statusCode: outcome.page.status,
        extractor: { id: extractor.id, version: extractor.version },
        pageType: pageType.name,
        data: extractPageType(outcome.page.html, pageType, outcome.page.url),
      },
    },
    creditsCharged: cost,
    creditsRemaining,
  };
};
