import "server-only";
import { env } from "@/lib/env";
import type { PlaygroundRequest, PlaygroundResponse } from "./types";

const SERVICE_UNAVAILABLE = 503;

const numberHeader = (response: Response, name: string): number | null => {
  const value = response.headers.get(name);
  return value === null ? null : Number(value);
};

const unavailable = (durationMs: number): PlaygroundResponse => ({
  status: SERVICE_UNAVAILABLE,
  durationMs,
  creditsCharged: null,
  creditsRemaining: null,
  body: {
    success: false,
    error: {
      code: "SERVICE_UNAVAILABLE",
      message: "The service is temporarily unavailable. Please try again.",
    },
  },
});

export const runGoogleSearch = async (
  workspaceId: string,
  request: PlaygroundRequest,
): Promise<PlaygroundResponse> => {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${env.API_URL}/v1/monitor/google`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": env.INTERNAL_API_TOKEN,
        "X-Workspace-Id": workspaceId,
      },
      body: JSON.stringify(request),
    });
    return {
      status: response.status,
      durationMs: Date.now() - startedAt,
      creditsCharged: numberHeader(response, "X-Credits-Charged"),
      creditsRemaining: numberHeader(response, "X-Credits-Remaining"),
      body: await response.json(),
    };
  } catch {
    return unavailable(Date.now() - startedAt);
  }
};
