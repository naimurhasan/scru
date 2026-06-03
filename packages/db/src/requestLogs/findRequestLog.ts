import { and, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { requestLogs } from "../schema.ts";

export const findRequestLog = async (
  db: Database,
  workspaceId: string,
  logId: string,
) => {
  const [log] = await db
    .select()
    .from(requestLogs)
    .where(
      and(eq(requestLogs.id, logId), eq(requestLogs.workspaceId, workspaceId)),
    )
    .limit(1);
  return log ?? null;
};
