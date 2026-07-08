import { toTaskView } from "@scru/core";
import type { PendingWebhookDelivery, WebhookAttempt } from "@scru/db";
import type { WebhookProcessor } from "@scru/queue";
import type { WebhookRequest, WebhookResult } from "./sendWebhook.ts";

export type WebhookDeps = {
  findDelivery: (deliveryId: string) => Promise<PendingWebhookDelivery | null>;
  recordAttempt: (deliveryId: string, attempt: WebhookAttempt) => Promise<void>;
  send: (request: WebhookRequest) => Promise<WebhookResult>;
  isAllowedUrl: (url: string) => boolean;
};

export const createWebhookProcessor =
  (deps: WebhookDeps): WebhookProcessor =>
  async ({ deliveryId, isLastAttempt }) => {
    const found = await deps.findDelivery(deliveryId);
    if (!found || found.delivery.status === "delivered") return;
    const { delivery, task, secret } = found;

    if (!deps.isAllowedUrl(delivery.url)) {
      await deps.recordAttempt(deliveryId, {
        status: "failed",
        httpStatus: null,
        error: "The address is not allowed",
      });
      return;
    }

    const result = await deps.send({
      url: delivery.url,
      secret,
      payload: { event: delivery.event, task: toTaskView(task) },
    });
    if (result.ok) {
      await deps.recordAttempt(deliveryId, {
        status: "delivered",
        httpStatus: result.httpStatus,
        error: null,
      });
      return;
    }

    await deps.recordAttempt(deliveryId, {
      status: isLastAttempt ? "failed" : "pending",
      httpStatus: result.httpStatus,
      error: result.error,
    });
    throw new Error(`Webhook delivery failed: ${result.error}`);
  };
