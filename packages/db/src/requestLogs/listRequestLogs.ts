import { desc, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { requestLogs } from "../schema.ts";

export const listRequestLogs = (
  db: Database,
  workspaceId: string,
  limit: number,
) =>
  db
    .select({
      id: requestLogs.id,
      engine: requestLogs.engine,
      request: requestLogs.request,
      httpStatus: requestLogs.httpStatus,
      errorCode: requestLogs.errorCode,
      creditsCharged: requestLogs.creditsCharged,
      durationMs: requestLogs.durationMs,
      createdAt: requestLogs.createdAt,
    })
    .from(requestLogs)
    .where(eq(requestLogs.workspaceId, workspaceId))
    .orderBy(desc(requestLogs.createdAt))
    .limit(limit);

export type RequestLogSummary = Awaited<
  ReturnType<typeof listRequestLogs>
>[number];
