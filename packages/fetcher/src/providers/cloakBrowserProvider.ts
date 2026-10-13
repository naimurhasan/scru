import { launchPersistentContext } from "cloakbrowser";
import type { BrowserContext } from "playwright-core";
import type { BrowserProvider, BrowserProviderOptions } from "../types.ts";

export const createCloakBrowserProvider = (
  options: BrowserProviderOptions,
): BrowserProvider => {
  let context: Promise<BrowserContext> | undefined;

  const openContext = () => {
    context ??= launchPersistentContext({
      userDataDir: options.profileDir,
      headless: options.headless,
      locale: options.locale,
      proxy: options.route.proxy,
      humanize: true,
    });
    return context;
  };

  return {
    name: "cloakbrowser",
    openPage: async () => (await openContext()).newPage(),
    close: async () => {
      const opened = context;
      context = undefined;
      await (await opened)?.close();
    },
  };
};
