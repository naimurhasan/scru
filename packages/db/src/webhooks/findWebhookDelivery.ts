import { eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { tasks, webhookDeliveries, workspaces } from "../schema.ts";

export const findWebhookDelivery = async (db: Database, deliveryId: string) => {
  const [found] = await db
    .select({
      delivery: webhookDeliveries,
      task: tasks,
      secret: workspaces.webhookSecret,
    })
    .from(webhookDeliveries)
    .innerJoin(tasks, eq(tasks.id, webhookDeliveries.taskId))
    .innerJoin(workspaces, eq(workspaces.id, webhookDeliveries.workspaceId))
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);
  return found ?? null;
};

export type PendingWebhookDelivery = NonNullable<
  Awaited<ReturnType<typeof findWebhookDelivery>>
>;
