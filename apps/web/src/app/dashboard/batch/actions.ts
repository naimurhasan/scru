"use server";

import type { CrawlFormState } from "@/lib/extractors/crawlFormState";
import { parseUrlList } from "@/lib/sites/parseUrlList";
import { startSiteTask } from "@/lib/sites/startSiteTask";

export const startBatchAction = async (
  _previous: CrawlFormState,
  form: FormData,
): Promise<CrawlFormState> =>
  startSiteTask(
    "/v1/batch",
    {
      urls: parseUrlList(String(form.get("urls") ?? "")),
      output: String(form.get("output")),
    },
    "/dashboard/batch",
  );
