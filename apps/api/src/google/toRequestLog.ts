import type { ActiveApiKey, NewRequestLog } from "@scru/db";
import { toErrorBody } from "../errors/toErrorBody.ts";
import type { GoogleSearchExecution } from "./executeGoogleSearch.ts";
import type { GoogleSearchRequest } from "./schemas.ts";

const OK = 200;

export type RequestLogInput = {
  apiKey: ActiveApiKey;
  request: GoogleSearchRequest;
  execution: GoogleSearchExecution;
  durationMs: number;
  now: Date;
};

const withoutHtml = ({ html: _html, ...result }: { html?: string }) => result;

export const toRequestLog = ({
  apiKey,
  request,
  execution,
  durationMs,
  now,
}: RequestLogInput): NewRequestLog => ({
  workspaceId: apiKey.workspaceId,
  apiKeyId: apiKey.apiKeyId,
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
