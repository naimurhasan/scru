import type { NewRequestLog, RequestActor } from "@scru/db";
import { toErrorBody } from "../errors/toErrorBody.ts";
import type { Execution } from "./types.ts";

const OK = 200;

export type RequestLogInput<Body> = {
  actor: RequestActor;
  engine: string;
  request: unknown;
  execution: Execution<Body>;
  loggedBody: (body: Body) => unknown;
  durationMs: number;
  now: Date;
};

export const toRequestLog = <Body>({
  actor,
  engine,
  request,
  execution,
  loggedBody,
  durationMs,
  now,
}: RequestLogInput<Body>): NewRequestLog => ({
  workspaceId: actor.workspaceId,
  apiKeyId: actor.apiKeyId,
  engine,
  request,
  durationMs,
  ...(execution.ok
    ? {
        httpStatus: OK,
        creditsCharged: execution.creditsCharged,
        response: loggedBody(execution.body),
      }
    : {
        httpStatus: execution.error.status,
        errorCode: execution.error.code,
        creditsCharged: 0,
        response: toErrorBody(execution.error, now),
      }),
});
