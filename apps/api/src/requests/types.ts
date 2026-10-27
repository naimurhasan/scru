import type { ApiError } from "../errors/ApiError.ts";

export type Execution<Body> =
  | {
      ok: true;
      body: Body;
      creditsCharged: number;
      creditsRemaining: number;
    }
  | { ok: false; error: ApiError };
