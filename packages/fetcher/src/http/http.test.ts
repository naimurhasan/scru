import { describe, expect, it, vi } from "vitest";
import { keepIdentityHeaders } from "../harvest/harvestSession.ts";
import type { FetchedPage } from "../types.ts";
import { buildSearchUrl } from "./buildSearchUrl.ts";
import type { SessionClient } from "./createSessionClient.ts";
import { fetchSearchPages } from "./fetchSearchPages.ts";
import { pickImpersonation } from "./pickImpersonation.ts";

const results = (url: string): FetchedPage => ({
  url,
  status: 200,
  html: '<div id="search"></div>',
});

const captcha = (url: string): FetchedPage => ({
  url: "https://www.google.com/sorry/index",
  status: 429,
  html: url,
});

const fakeClient = (page: (url: string) => FetchedPage) => ({
  fetchPage: vi.fn<SessionClient["fetchPage"]>(async (url) => page(url)),
  resolveRedirect: vi.fn<SessionClient["resolveRedirect"]>(async () => null),
});

const input = { query: "best crm", country: "US", language: "en", pages: 1 };

describe("buildSearchUrl", () => {
  it("builds the first page with country and language", () => {
    expect(
      buildSearchUrl({
        query: "best crm",
        country: "US",
        language: "en",
        page: 1,
      }),
    ).toBe("https://www.google.com/search?q=best+crm&hl=en&gl=us");
  });

  it("offsets later pages by ten results", () => {
    expect(
      buildSearchUrl({ query: "crm", country: "GB", language: "en", page: 3 }),
    ).toBe("https://www.google.com/search?q=crm&hl=en&gl=gb&start=20");
  });
});

describe("pickImpersonation", () => {
  it("picks the newest profile not newer than the browser", () => {
    expect(
      pickImpersonation("Mozilla/5.0 Chrome/145.0.0.0 Safari/537.36"),
    ).toBe("chrome142");
    expect(pickImpersonation("Mozilla/5.0 Chrome/151.0.0.0")).toBe("chrome151");
    expect(pickImpersonation("Mozilla/5.0 Chrome/160.0.0.0")).toBe("chrome151");
  });

  it("falls back to the default Chrome profile", () => {
    expect(pickImpersonation("Mozilla/5.0 Chrome/90.0.0.0")).toBe("chrome");
    expect(pickImpersonation("")).toBe("chrome");
  });
});

describe("keepIdentityHeaders", () => {
  it("keeps the browser identity and drops connection-specific headers", () => {
    expect(
      keepIdentityHeaders({
        ":authority": "www.google.com",
        host: "www.google.com",
        cookie: "NID=1",
        "accept-encoding": "gzip, br",
        "user-agent": "Chrome/145",
        "sec-ch-ua": '"Chromium";v="145"',
        "accept-language": "en-US,en;q=0.9",
      }),
    ).toEqual({
      "user-agent": "Chrome/145",
      "sec-ch-ua": '"Chromium";v="145"',
      "accept-language": "en-US,en;q=0.9",
    });
  });
});

describe("fetchSearchPages", () => {
  it("fetches one page", async () => {
    const client = fakeClient(results);
    const pages = await fetchSearchPages(client, input);

    expect(pages).toHaveLength(1);
    expect(client.fetchPage).toHaveBeenCalledTimes(1);
  });

  it("fetches every requested page", async () => {
    const client = fakeClient(results);
    const pages = await fetchSearchPages(client, { ...input, pages: 3 });

    expect(
      pages.map(({ url }) => new URL(url).searchParams.get("start")),
    ).toEqual([null, "10", "20"]);
  });

  it("stops at the first blocked page and keeps the pages before it", async () => {
    const client = fakeClient((url) =>
      url.includes("start=20") ? captcha(url) : results(url),
    );
    const pages = await fetchSearchPages(client, { ...input, pages: 4 });

    expect(pages).toHaveLength(2);
  });

  it("returns only the blocked first page without asking for more", async () => {
    const client = fakeClient(captcha);
    const pages = await fetchSearchPages(client, { ...input, pages: 3 });

    expect(pages).toHaveLength(1);
    expect(client.fetchPage).toHaveBeenCalledTimes(1);
  });
});
