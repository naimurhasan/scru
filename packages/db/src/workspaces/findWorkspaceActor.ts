import { eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import type { RequestActor } from "../requestActor.ts";
import { workspaces } from "../schema.ts";

export const findWorkspaceActor = async (
  db: Database,
  workspaceId: string,
): Promise<RequestActor | null> => {
  const [workspace] = await db
    .select({
      workspaceId: workspaces.id,
      credits: workspaces.credits,
      concurrencyLimit: workspaces.concurrencyLimit,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return workspace ? { ...workspace, apiKeyId: null } : null;
};
