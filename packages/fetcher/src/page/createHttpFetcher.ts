import type { ProxyRequest } from "@scru/core";
import { Impit } from "impit";
import type { FetchedPage, RouteProvider } from "../types.ts";

const DIRECT_TIMEOUT_MS = 20_000;
const PROXY_TIMEOUT_MS = 10_000;
const PROXY_ATTEMPTS = 3;

const fetchWith = async (client: Impit, url: string): Promise<FetchedPage> => {
  const response = await client.fetch(url);
  return {
    url: response.url,
    status: response.status,
    html: await response.text(),
  };
};

export const createHttpFetcher = (routes: RouteProvider) => {
  const direct = new Impit({ browser: "chrome", timeout: DIRECT_TIMEOUT_MS });

  return async (
    url: string,
    proxy: ProxyRequest | null,
  ): Promise<FetchedPage> => {
    if (!proxy) return fetchWith(direct, url);
    for (let attempt = 1; ; attempt += 1) {
      const route = routes.routeFor({ ...proxy, sticky: false });
      const client = new Impit({
        browser: "chrome",
        timeout: PROXY_TIMEOUT_MS,
        ...(route.proxy && { proxyUrl: route.proxy }),
      });
      try {
        return await fetchWith(client, url);
      } catch (error) {
        if (attempt >= PROXY_ATTEMPTS) throw error;
      }
    }
  };
};
