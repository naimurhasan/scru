import type { StoredExtractor } from "@scru/core";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { extractors } from "../schema.ts";
import { toStoredExtractor } from "./toStoredExtractor.ts";

export const findLatestExtractor = async (
  db: Database,
  workspaceId: string,
  host: string,
): Promise<StoredExtractor | null> => {
  const [row] = await db
    .select()
    .from(extractors)
    .where(
      and(eq(extractors.workspaceId, workspaceId), eq(extractors.host, host)),
    )
    .orderBy(desc(extractors.version))
    .limit(1);
  return row ? toStoredExtractor(row) : null;
};
