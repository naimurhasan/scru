import type { Page } from "playwright-core";
import type { FetchedPage } from "../types.ts";
import { snapshotPage } from "./snapshotPage.ts";

const NEXT_LINK = "#pnnext";
const SHORTEST_PAUSE_MS = 900;
const PAUSE_SPREAD_MS = 1_400;

export const openNextPage = async (
  page: Page,
  timeoutMs: number,
): Promise<FetchedPage | null> => {
  const next = page.locator(NEXT_LINK);
  if ((await next.count()) === 0) return null;
  await page.waitForTimeout(
    SHORTEST_PAUSE_MS + Math.random() * PAUSE_SPREAD_MS,
  );
  const navigation = page.waitForNavigation({
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
  await next.click({ timeout: timeoutMs });
  return snapshotPage(page, await navigation, timeoutMs);
};
