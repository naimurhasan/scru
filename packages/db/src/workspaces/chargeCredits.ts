import { and, eq, gte, sql } from "drizzle-orm";
import type { Database } from "../client.ts";
import { workspaces } from "../schema.ts";

export const chargeCredits = async (
  db: Database,
  workspaceId: string,
  amount: number,
): Promise<number | null> => {
  const [charged] = await db
    .update(workspaces)
    .set({ credits: sql`${workspaces.credits} - ${amount}` })
    .where(and(eq(workspaces.id, workspaceId), gte(workspaces.credits, amount)))
    .returning({ credits: workspaces.credits });
  return charged?.credits ?? null;
};
