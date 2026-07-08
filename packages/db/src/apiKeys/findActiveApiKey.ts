import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../client.ts";
import type { RequestActor } from "../requestActor.ts";
import { apiKeys, workspaces } from "../schema.ts";

export const findActiveApiKey = async (
  db: Database,
  keyHash: string,
): Promise<RequestActor | null> => {
  const [found] = await db
    .select({
      apiKeyId: apiKeys.id,
      workspaceId: workspaces.id,
      credits: workspaces.credits,
      concurrencyLimit: workspaces.concurrencyLimit,
    })
    .from(apiKeys)
    .innerJoin(workspaces, eq(workspaces.id, apiKeys.workspaceId))
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);
  return found ?? null;
};
