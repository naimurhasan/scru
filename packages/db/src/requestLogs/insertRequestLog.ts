import type { Database } from "../client.ts";
import { requestLogs } from "../schema.ts";

export type NewRequestLog = typeof requestLogs.$inferInsert;

export const insertRequestLog = async (
  db: Database,
  log: NewRequestLog,
): Promise<void> => {
  await db.insert(requestLogs).values(log);
};
