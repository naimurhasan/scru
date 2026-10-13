import { generateApiKey } from "@scru/core";
import type { Database } from "../client.ts";
import { apiKeys } from "../schema.ts";

export type NewApiKey = {
  workspaceId: string;
  name: string;
};

export const createApiKey = async (
  db: Database,
  { workspaceId, name }: NewApiKey,
) => {
  const { key, hash, preview } = generateApiKey();
  const [created] = await db
    .insert(apiKeys)
    .values({ workspaceId, name, keyHash: hash, keyPreview: preview })
    .returning({ id: apiKeys.id });
  if (!created) throw new Error("API key was not created");
  return { id: created.id, key, preview };
};
