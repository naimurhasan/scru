"use server";

import { findExtractor, saveExtractor } from "@scru/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import { db } from "@/lib/db";
import { applyFieldEdits } from "@/lib/extractors/applyFieldEdits";
import type { CrawlFormState } from "@/lib/extractors/crawlFormState";
import type { PrepareFormState } from "@/lib/extractors/prepareFormState";
import type { ExtractorField } from "@/lib/extractors/types";
import { callApi } from "@/lib/playground/callApi";
import { requireWorkspace } from "@/lib/requireWorkspace";

const FIRST_ERROR_STATUS = 400;
const MAX_FIELDS = 30;
const CRAWL_DEPTH = 2;

const fieldsSchema = z.array(
  z
    .array(
      z.object({
        name: z.string().max(60),
        description: z.string().max(300),
        selector: z.string().max(300),
        attribute: z.string().max(60).nullable(),
      }),
    )
    .max(MAX_FIELDS),
);

export const prepareExtractorAction = async (
  _previous: PrepareFormState,
  form: FormData,
): Promise<PrepareFormState> => {
  const { workspace } = await requireWorkspace();
  const url = String(form.get("url") ?? "").trim();
  const response = await callApi(workspace.id, "/v1/extractors", { url });
  if (response.status >= FIRST_ERROR_STATUS)
    return { error: readErrorMessage(response.body), submitted: false };
  revalidatePath("/dashboard/extractors");
  return { error: null, submitted: true };
};

export const startJsonCrawlAction = async (
  _previous: CrawlFormState,
  form: FormData,
): Promise<CrawlFormState> => {
  const { workspace } = await requireWorkspace();
  const response = await callApi(workspace.id, "/v1/crawl", {
    url: String(form.get("url") ?? "").trim(),
    limit: Number(form.get("limit")),
    maxDepth: CRAWL_DEPTH,
    output: "json",
  });
  if (response.status >= FIRST_ERROR_STATUS)
    return { error: readErrorMessage(response.body), started: false };
  revalidatePath("/dashboard/extractors/[id]", "page");
  return { error: null, started: true };
};

export const saveExtractorFieldsAction = async (
  id: string,
  fieldsByPageType: ExtractorField[][],
): Promise<{ error: string }> => {
  const { workspace } = await requireWorkspace();
  const extractor = await findExtractor(db, workspace.id, z.uuid().parse(id));
  if (!extractor) return { error: "This extractor no longer exists." };
  const edits = applyFieldEdits(
    extractor.pageTypes,
    fieldsSchema.parse(fieldsByPageType),
  );
  if (!edits.ok) return { error: edits.error };
  const saved = await saveExtractor(db, {
    workspaceId: workspace.id,
    taskId: null,
    host: extractor.host,
    pageTypes: edits.pageTypes,
    fetchOptions: extractor.fetchOptions,
    model: extractor.model,
  });
  revalidatePath("/dashboard/extractors");
  redirect(`/dashboard/extractors/${saved.id}`);
};
