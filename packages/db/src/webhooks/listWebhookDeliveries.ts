import { desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { webhookDeliveries } from "../schema.ts";

export const listWebhookDeliveries = (
  db: Database,
  workspaceId: string,
  limit: number,
) =>
  db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.workspaceId, workspaceId))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
