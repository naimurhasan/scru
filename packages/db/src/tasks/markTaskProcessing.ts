import { and, eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { tasks } from "../schema.ts";

export const markTaskProcessing = async (
  db: Database,
  taskId: string,
): Promise<void> => {
  await db
    .update(tasks)
    .set({ status: "PROCESSING", startedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.status, "QUEUED")));
};
