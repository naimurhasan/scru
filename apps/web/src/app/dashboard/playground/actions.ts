"use server";

import { z } from "zod";
import { runGoogleSearch } from "@/lib/playground/runGoogleSearch";
import type {
  PlaygroundRequest,
  PlaygroundResponse,
} from "@/lib/playground/types";
import { requireWorkspace } from "@/lib/requireWorkspace";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  country: z.string().regex(/^[A-Z]{2}$/),
});

export const sendPlaygroundRequest = async (
  input: PlaygroundRequest,
): Promise<PlaygroundResponse> => {
  const { workspace } = await requireWorkspace();
  return runGoogleSearch(workspace.id, requestSchema.parse(input));
};
