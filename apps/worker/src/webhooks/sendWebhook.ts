import { signWebhookPayload, WEBHOOK_SIGNATURE_HEADER } from "@scru/core";

export type WebhookRequest = {
  url: string;
  secret: string;
  payload: unknown;
};

export type WebhookResult = {
  ok: boolean;
  httpStatus: number | null;
  error: string | null;
};

const TIMEOUT_MS = 10_000;
const MILLISECONDS_PER_SECOND = 1_000;

export const sendWebhook = async ({
  url,
  secret,
  payload,
}: WebhookRequest): Promise<WebhookResult> => {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
  try {
    const response = await fetch(url, {
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "scru-webhooks/1.0",
        [WEBHOOK_SIGNATURE_HEADER]: signWebhookPayload(secret, timestamp, body),
      },
      body,
    });
    return response.ok
      ? { ok: true, httpStatus: response.status, error: null }
      : {
          ok: false,
          httpStatus: response.status,
          error: `The endpoint answered ${response.status}`,
        };
  } catch (error) {
    return {
      ok: false,
      httpStatus: null,
      error: error instanceof Error ? error.message : "The request failed",
    };
  }
};
