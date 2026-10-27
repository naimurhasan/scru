import type { RequestActor } from "@scru/db";
import type { Context } from "hono";
import type { ApiDeps, ApiEnv } from "../deps.ts";
import { reserveConcurrency } from "../limits/reserveConcurrency.ts";
import { toRequestLog } from "./toRequestLog.ts";
import type { Execution } from "./types.ts";

export type MeteredRequest<Body> = {
  engine: string;
  request: unknown;
  execute: (actor: RequestActor) => Promise<Execution<Body>>;
  loggedBody: (body: Body) => unknown;
};

export const meterRequest = async <Body>(
  c: Context<ApiEnv>,
  deps: Pick<ApiDeps, "limits" | "recordRequest">,
  { engine, request, execute, loggedBody }: MeteredRequest<Body>,
): Promise<Body> => {
  const actor = c.get("actor");
  await reserveConcurrency(c, deps.limits);
  try {
    const startedAt = Date.now();
    const execution = await execute(actor);
    await deps.recordRequest(
      toRequestLog({
        actor,
        engine,
        request,
        execution,
        loggedBody,
        durationMs: Date.now() - startedAt,
        now: new Date(),
      }),
    );
    if (!execution.ok) throw execution.error;
    c.header("X-Credits-Charged", String(execution.creditsCharged));
    c.header("X-Credits-Remaining", String(execution.creditsRemaining));
    return execution.body;
  } finally {
    await deps.limits.releaseConcurrency(actor.workspaceId);
  }
};
