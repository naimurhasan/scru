import { randomUUID } from "node:crypto";
import type { GoogleSession } from "@scru/core";
import { detectBlock } from "../google/detectBlock.ts";
import { openFirstPage } from "../google/openFirstPage.ts";
import type { BrowserProvider } from "../types.ts";

const GOOGLE = "https://www.google.com";
const WARM_UP_QUERIES = ["weather today", "news", "time in london", "maps"];
const OWN_HEADERS = new Set([
  "host",
  "cookie",
  "content-length",
  "connection",
  "accept-encoding",
]);

export const keepIdentityHeaders = (
  headers: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => !name.startsWith(":") && !OWN_HEADERS.has(name),
    ),
  );

export const harvestSession = async (
  provider: BrowserProvider,
  timeoutMs: number,
): Promise<GoogleSession | null> => {
  const tab = await provider.openPage();
  let headers: Record<string, string> = {};
  tab.on("request", async (request) => {
    if (request.isNavigationRequest() && request.url().includes("/search?"))
      headers = await request.allHeaders();
  });
  try {
    const query =
      WARM_UP_QUERIES[Math.floor(Math.random() * WARM_UP_QUERIES.length)] ??
      "news";
    const page = await openFirstPage(tab, {
      query,
      country: "US",
      language: "en",
      timeoutMs,
    });
    if (detectBlock(page) || !headers["user-agent"]) return null;
    const cookies = await tab.context().cookies(GOOGLE);
    return {
      id: randomUUID(),
      cookie: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
      headers: keepIdentityHeaders(headers),
      createdAt: Date.now(),
    };
  } finally {
    await tab.close();
  }
};
