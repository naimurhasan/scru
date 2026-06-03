import type { NewRequestLog, RequestActor } from "@scru/db";
import { toErrorBody } from "../errors/toErrorBody.ts";
import type { GoogleSearchExecution } from "./executeGoogleSearch.ts";
import type { GoogleSearchRequest } from "./schemas.ts";

const OK = 200;

export type RequestLogInput = {
  actor: RequestActor;
  request: GoogleSearchRequest;
  execution: GoogleSearchExecution;
  durationMs: number;
  now: Date;
};

const withoutHtml = ({ html: _html, ...result }: { html?: string }) => result;

export const toRequestLog = ({
  actor,
  request,
  execution,
  durationMs,
  now,
}: RequestLogInput): NewRequestLog => ({
  workspaceId: actor.workspaceId,
  apiKeyId: actor.apiKeyId,
  engine: "google",
  request,
  durationMs,
  ...(execution.ok
    ? {
        httpStatus: OK,
        creditsCharged: execution.creditsCharged,
        response: {
          success: true,
          result: withoutHtml(execution.body.result),
        },
      }
    : {
        httpStatus: execution.error.status,
        errorCode: execution.error.code,
        creditsCharged: 0,
        response: toErrorBody(execution.error, now),
      }),
});
