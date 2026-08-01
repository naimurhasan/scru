import type { Page, Response } from "playwright-core";
import type { FetchedPage } from "../types.ts";
import { resolveRedirectLinks } from "./resolveRedirectLinks.ts";

const SETTLED = "#search, #captcha-form";

export const snapshotPage = async (
  page: Page,
  response: Response | null,
  timeoutMs: number,
): Promise<FetchedPage> => {
  await page
    .waitForSelector(SETTLED, { timeout: timeoutMs })
    .catch(() => undefined);
  await resolveRedirectLinks(page);
  return {
    url: page.url(),
    status: response?.status() ?? 0,
    html: await page.content(),
  };
};
