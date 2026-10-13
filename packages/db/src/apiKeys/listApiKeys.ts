import { desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { apiKeys } from "../schema.ts";

export const listApiKeys = (db: Database, workspaceId: string) =>
  db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPreview: apiKeys.keyPreview,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspaceId))
    .orderBy(desc(apiKeys.createdAt));

export type ApiKeySummary = Awaited<ReturnType<typeof listApiKeys>>[number];
