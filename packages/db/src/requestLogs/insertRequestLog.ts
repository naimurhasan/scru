import type { Executor } from "../client.ts";
import { requestLogs } from "../schema.ts";

export type NewRequestLog = typeof requestLogs.$inferInsert;

export const insertRequestLog = async (
  db: Executor,
  log: NewRequestLog,
): Promise<void> => {
  await db.insert(requestLogs).values(log);
};
