import type { GoogleSession } from "@scru/core";
import { Impit } from "impit";
import type { FetchedPage } from "../types.ts";
import { pickImpersonation } from "./pickImpersonation.ts";

export type SessionClient = {
  fetchPage: (url: string) => Promise<FetchedPage>;
  resolveRedirect: (url: string) => Promise<string | null>;
};

const TIMEOUT_MS = 15_000;

export const createSessionClient = (session: GoogleSession): SessionClient => {
  const browser = pickImpersonation(session.headers["user-agent"] ?? "");
  const headers = { ...session.headers, cookie: session.cookie };
  const pages = new Impit({ browser, timeout: TIMEOUT_MS });
  const redirects = new Impit({
    browser,
    timeout: TIMEOUT_MS,
    followRedirects: false,
  });

  return {
    fetchPage: async (url) => {
      const response = await pages.fetch(url, { headers });
      return {
        url: response.url,
        status: response.status,
        html: await response.text(),
      };
    },
    resolveRedirect: async (url) => {
      const response = await redirects.fetch(url, { headers });
      return response.headers.get("location");
    },
  };
};
