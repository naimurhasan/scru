import type { StoredExtractor } from "@scru/core";
import { desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { extractors } from "../schema.ts";
import { toStoredExtractor } from "./toStoredExtractor.ts";

const MAX_LISTED = 100;

export const listExtractors = async (
  db: Database,
  workspaceId: string,
): Promise<StoredExtractor[]> => {
  const rows = await db
    .select()
    .from(extractors)
    .where(eq(extractors.workspaceId, workspaceId))
    .orderBy(desc(extractors.createdAt))
    .limit(MAX_LISTED);
  return rows.map(toStoredExtractor);
};
