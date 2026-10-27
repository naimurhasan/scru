import { launch } from "cloakbrowser";
import type { Browser } from "playwright-core";
import type { BrowserProvider, Route } from "../types.ts";

export type LaunchedBrowserOptions = {
  route: Route;
  headless: boolean;
  timezone: string | null;
};

export const createLaunchedBrowserProvider = ({
  route,
  headless,
  timezone,
}: LaunchedBrowserOptions): BrowserProvider => {
  let browser: Promise<Browser> | undefined;

  const openBrowser = () => {
    browser ??= launch({
      headless,
      humanize: true,
      ...(route.proxy && { proxy: route.proxy }),
      ...(timezone && { timezone }),
    });
    return browser;
  };

  return {
    name: "cloakbrowser-launched",
    openPage: async () => (await openBrowser()).newPage(),
    close: async () => {
      const opened = browser;
      browser = undefined;
      await (await opened)?.close();
    },
  };
};
