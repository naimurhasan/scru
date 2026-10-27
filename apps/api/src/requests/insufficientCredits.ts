import { ApiError } from "../errors/ApiError.ts";
import type { Execution } from "./types.ts";

export const insufficientCredits = (cost: number): Execution<never> => ({
  ok: false,
  error: new ApiError(
    "INSUFFICIENT_CREDITS",
    "Not enough credits for this request",
    { required: cost },
  ),
});
