import { eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { workspaces } from "../schema.ts";

export const saveWebhookUrl = async (
  db: Database,
  workspaceId: string,
  webhookUrl: string | null,
): Promise<void> => {
  await db
    .update(workspaces)
    .set({ webhookUrl })
    .where(eq(workspaces.id, workspaceId));
};
