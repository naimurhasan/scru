import type { PageOutcome, RenderJob } from "@scru/core";
import {
  createLaunchedBrowserProvider,
  lookupExitTimezone,
  renderPage,
  type BrowserProvider,
  type RenderOptions,
  type RouteProvider,
} from "@scru/fetcher";

export type RenderProcessorDeps = {
  sharedBrowser: BrowserProvider;
  routes: RouteProvider;
  headless: boolean;
  options: RenderOptions;
};

export const createRenderProcessor =
  ({ sharedBrowser, routes, headless, options }: RenderProcessorDeps) =>
  async ({ data }: { data: RenderJob }): Promise<PageOutcome> => {
    if (!data.proxy) return renderPage(sharedBrowser, data, options);
    const route = routes.routeFor({ ...data.proxy, sticky: true });
    const browser = createLaunchedBrowserProvider({
      route,
      headless,
      timezone: await lookupExitTimezone(route),
    });
    try {
      return await renderPage(browser, data, options);
    } finally {
      await browser.close();
    }
  };
