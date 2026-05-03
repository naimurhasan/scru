import type { Database } from "../client.ts";
import { workspaces } from "../schema.ts";

export type NewWorkspace = {
  name: string;
  credits: number;
};

export const createWorkspace = async (
  db: Database,
  workspace: NewWorkspace,
) => {
  const [created] = await db.insert(workspaces).values(workspace).returning();
  if (!created) throw new Error("Workspace was not created");
  return created;
};
