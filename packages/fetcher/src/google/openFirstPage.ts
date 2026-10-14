import type { Page } from "playwright-core";
import type { FetchedPage } from "../types.ts";
import { snapshotPage } from "./snapshotPage.ts";

export type SearchInput = {
  query: string;
  country: string;
  language: string;
  timeoutMs: number;
};

const SEARCH_BOX = 'textarea[name="q"], input[name="q"]';
const TYPING_DELAY_MS = 90;

export const openFirstPage = async (
  page: Page,
  { query, country, language, timeoutMs }: SearchInput,
): Promise<FetchedPage> => {
  const home = new URL("https://www.google.com/");
  home.searchParams.set("hl", language);
  home.searchParams.set("gl", country.toLowerCase());
  await page.goto(home.href, {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
  const searchBox = page.locator(SEARCH_BOX).first();
  await searchBox.click({ timeout: timeoutMs });
  await searchBox.pressSequentially(query, { delay: TYPING_DELAY_MS });
  const navigation = page.waitForNavigation({
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
  await page.keyboard.press("Enter");
  return snapshotPage(page, await navigation, timeoutMs);
};
