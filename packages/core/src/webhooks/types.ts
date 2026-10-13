import type { TaskView } from "../tasks/types.ts";

export const WEBHOOK_EVENTS = ["task.completed", "task.failed"] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export type WebhookPayload = {
  event: WebhookEvent;
  task: TaskView;
};

export const WEBHOOK_SIGNATURE_HEADER = "X-Scru-Signature";
