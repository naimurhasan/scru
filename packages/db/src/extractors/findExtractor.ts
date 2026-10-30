import type { StoredExtractor } from "@scru/core";
import { and, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { extractors } from "../schema.ts";
import { toStoredExtractor } from "./toStoredExtractor.ts";

export const findExtractor = async (
  db: Database,
  workspaceId: string,
  id: string,
): Promise<StoredExtractor | null> => {
  const [row] = await db
    .select()
    .from(extractors)
    .where(and(eq(extractors.id, id), eq(extractors.workspaceId, workspaceId)))
    .limit(1);
  return row ? toStoredExtractor(row) : null;
};
