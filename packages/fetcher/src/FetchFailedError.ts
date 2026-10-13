import type { BlockReason } from "./google/detectBlock.ts";

export type FetchFailure = BlockReason | "navigation_failed";

export class FetchFailedError extends Error {
  readonly reason: FetchFailure;
  readonly attempts: number;

  constructor(reason: FetchFailure, attempts: number) {
    super(`Fetch failed after ${attempts} attempts: ${reason}`);
    this.name = "FetchFailedError";
    this.reason = reason;
    this.attempts = attempts;
  }
}
