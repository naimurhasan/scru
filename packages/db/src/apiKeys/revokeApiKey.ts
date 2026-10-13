import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../client.ts";
import { apiKeys } from "../schema.ts";

export const revokeApiKey = async (
  db: Database,
  workspaceId: string,
  apiKeyId: string,
): Promise<void> => {
  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKeys.id, apiKeyId),
        eq(apiKeys.workspaceId, workspaceId),
        isNull(apiKeys.revokedAt),
      ),
    );
};
