import { and, eq, gte, sql } from "drizzle-orm";
import type { Database } from "../client.ts";
import { requestLogs } from "../schema.ts";

export type RequestStats = {
  total: number;
  succeeded: number;
  averageDurationMs: number | null;
};

const SUCCESS_BELOW = 400;

export const getRequestStats = async (
  db: Database,
  workspaceId: string,
  since: Date,
): Promise<RequestStats> => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      succeeded: sql<number>`count(*) filter (where ${requestLogs.httpStatus} < ${SUCCESS_BELOW})::int`,
      averageDurationMs: sql<
        number | null
      >`round(avg(${requestLogs.durationMs}) filter (where ${requestLogs.httpStatus} < ${SUCCESS_BELOW}))::int`,
    })
    .from(requestLogs)
    .where(
      and(
        eq(requestLogs.workspaceId, workspaceId),
        gte(requestLogs.createdAt, since),
      ),
    );
  return stats ?? { total: 0, succeeded: 0, averageDurationMs: null };
};
