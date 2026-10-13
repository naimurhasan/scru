import type { Page } from "playwright-core";

const REDIRECT_LINKS = 'a[href^="/goto?url="]';
const RESULT_TITLE_LINKS = `${REDIRECT_LINKS}:has(h3)`;

const resolveRedirect = async (page: Page, href: string) => {
  const response = await page.request.get(new URL(href, page.url()).href, {
    maxRedirects: 0,
  });
  return response.headers().location;
};

export const resolveRedirectLinks = async (page: Page): Promise<void> => {
  const hrefs = await page
    .locator(RESULT_TITLE_LINKS)
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
  const destinations: Record<string, string> = {};
  for (const href of new Set(hrefs)) {
    const destination = await resolveRedirect(page, href).catch(
      () => undefined,
    );
    if (destination) destinations[href] = destination;
  }
  await page.locator(REDIRECT_LINKS).evaluateAll((links, resolved) => {
    for (const link of links) {
      const destination = resolved[link.getAttribute("href") ?? ""];
      if (destination) link.setAttribute("href", destination);
    }
  }, destinations);
};
