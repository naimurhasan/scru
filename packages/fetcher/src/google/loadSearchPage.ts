import type { Page } from "playwright-core";
import type { FetchedPage } from "../types.ts";
import { resolveRedirectLinks } from "./resolveRedirectLinks.ts";

export type SearchPageInput = {
  query: string;
  country: string;
  language: string;
  timeoutMs: number;
};

const SEARCH_BOX = 'textarea[name="q"], input[name="q"]';
const SETTLED = "#search, #captcha-form";

export const loadSearchPage = async (
  page: Page,
  { query, country, language, timeoutMs }: SearchPageInput,
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
  await searchBox.pressSequentially(query, { delay: 90 });
  const navigation = page.waitForNavigation({
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
  await page.keyboard.press("Enter");
  const response = await navigation;
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
