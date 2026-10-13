import type { Context } from "hono";
import type { ApiDeps, ApiEnv } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";

export const reserveConcurrency = async (
  c: Context<ApiEnv>,
  limits: ApiDeps["limits"],
): Promise<void> => {
  const { workspaceId, concurrencyLimit } = c.get("actor");
  const slot = await limits.acquireConcurrency(workspaceId, concurrencyLimit);
  c.header("X-Concurrency-Limit", String(slot.limit));
  c.header("X-Concurrency-Current", String(slot.current));
  c.header(
    "X-Concurrency-Remaining",
    String(Math.max(slot.limit - slot.current, 0)),
  );
  if (!slot.acquired)
    throw new ApiError(
      "CONCURRENCY_LIMIT_REACHED",
      "Too many requests in progress. Wait for one to finish or use the async endpoint.",
      { limit: slot.limit },
    );
};
