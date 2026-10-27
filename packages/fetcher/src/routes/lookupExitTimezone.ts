import { Impit } from "impit";
import type { Route } from "../types.ts";

const LOOKUP_URL = "https://ipwho.is/?fields=success,timezone";
const TIMEOUT_MS = 10_000;

type ExitLookup = {
  success: boolean;
  timezone?: { id: string };
};

export const lookupExitTimezone = async (
  route: Route,
): Promise<string | null> => {
  const client = new Impit({
    browser: "chrome",
    timeout: TIMEOUT_MS,
    ...(route.proxy && { proxyUrl: route.proxy }),
  });
  try {
    const exit = (await (await client.fetch(LOOKUP_URL)).json()) as ExitLookup;
    return exit.success ? (exit.timezone?.id ?? null) : null;
  } catch {
    return null;
  }
};
