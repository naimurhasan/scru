import "server-only";
import { redirect } from "next/navigation";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import type { CrawlFormState } from "@/lib/extractors/crawlFormState";
import { callApi } from "@/lib/playground/callApi";
import { readTaskId } from "@/lib/playground/readTaskId";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const startSiteTask = async (
  path: string,
  body: unknown,
  basePath: string,
): Promise<CrawlFormState> => {
  const { workspace } = await requireWorkspace();
  const response = await callApi(workspace.id, path, body);
  const taskId = readTaskId(response.body);
  if (taskId === null)
    return { error: readErrorMessage(response.body), started: false };
  redirect(`${basePath}?task=${taskId}`);
};
