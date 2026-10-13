"use server";

import { createApiKey, revokeApiKey } from "@scru/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CreateKeyState } from "@/lib/apiKeys/createKeyState";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/requireWorkspace";

const API_KEYS_PATH = "/dashboard/api-keys";

const nameSchema = z.string().trim().min(1).max(60);
const idSchema = z.uuid();

export const createApiKeyAction = async (
  _previous: CreateKeyState,
  form: FormData,
): Promise<CreateKeyState> => {
  const { workspace } = await requireWorkspace();
  const name = nameSchema.safeParse(form.get("name"));
  if (!name.success)
    return { key: null, error: "Give the key a name of 1 to 60 characters." };
  const created = await createApiKey(db, {
    workspaceId: workspace.id,
    name: name.data,
  });
  revalidatePath(API_KEYS_PATH);
  return { key: created.key, error: null };
};

export const revokeApiKeyAction = async (form: FormData): Promise<void> => {
  const { workspace } = await requireWorkspace();
  await revokeApiKey(db, workspace.id, idSchema.parse(form.get("id")));
  revalidatePath(API_KEYS_PATH);
};
