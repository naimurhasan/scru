import { calculateFetchCredits, type PageFailureReason } from "@scru/core";
import type { RequestActor } from "@scru/db";
import { extractPage } from "@scru/extractor";
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
  const cost = calculateFetchCredits({
    jsRender: extractor.fetchOptions.jsRender,
    premiumProxy: extractor.fetchOptions.proxy !== null,
  });
  if (actor.credits < cost) return insufficientCredits(cost);

  const outcome = await deps.fetchPage({ ...extractor.fetchOptions, url });
  if (!outcome.ok) return { ok: false, error: toFetchError(outcome.reason) };

  const extracted = extractPage(
    extractor.pageTypes,
    outcome.page.html,
    outcome.page.url,
  );
  if (!extracted)
    return {
      ok: false,
      error: new ApiError(
        "NOT_FOUND",
        "None of the site's page types fit this page; nothing was charged",
        { patterns: extractor.pageTypes.map(({ pattern }) => pattern) },
      ),
    };

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
        pageType: extracted.pageType,
        data: extracted.data,
      },
    },
    creditsCharged: cost,
    creditsRemaining,
  };
};
