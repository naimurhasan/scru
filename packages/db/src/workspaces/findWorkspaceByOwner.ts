import { eq } from "drizzle-orm";
import type { Database } from "../client.ts";
import { workspaces } from "../schema.ts";

export const findWorkspaceByOwner = async (db: Database, ownerId: string) => {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, ownerId))
    .limit(1);
  return workspace ?? null;
};

export type Workspace = NonNullable<
  Awaited<ReturnType<typeof findWorkspaceByOwner>>
>;
