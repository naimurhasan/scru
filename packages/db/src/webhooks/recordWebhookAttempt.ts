import { eq, sql } from "drizzle-orm";
import type { Database } from "../client.ts";
import { webhookDeliveries } from "../schema.ts";

export type WebhookAttempt = {
  status: "delivered" | "pending" | "failed";
  httpStatus: number | null;
  error: string | null;
};

export const recordWebhookAttempt = async (
  db: Database,
  deliveryId: string,
  { status, httpStatus, error }: WebhookAttempt,
): Promise<void> => {
  await db
    .update(webhookDeliveries)
    .set({
      status,
      httpStatus,
      lastError: error,
      attempts: sql`${webhookDeliveries.attempts} + 1`,
      deliveredAt: status === "delivered" ? new Date() : null,
    })
    .where(eq(webhookDeliveries.id, deliveryId));
};
