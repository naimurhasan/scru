"use server";

import type { CrawlFormState } from "@/lib/extractors/crawlFormState";
import { startSiteTask } from "@/lib/sites/startSiteTask";

export const startCrawlAction = async (
  _previous: CrawlFormState,
  form: FormData,
): Promise<CrawlFormState> =>
  startSiteTask(
    "/v1/crawl",
    {
      url: String(form.get("url") ?? "").trim(),
      limit: Number(form.get("limit")),
      maxDepth: Number(form.get("maxDepth")),
      output: String(form.get("output")),
    },
    "/dashboard/crawl",
  );
