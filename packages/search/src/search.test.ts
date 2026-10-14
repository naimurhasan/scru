import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { GoogleSearchJob, GoogleSession, SearchOutcome } from "@scru/core";
import type { GoogleSearchResult } from "@scru/parser";
import { describe, expect, it, vi } from "vitest";
import {
  createSessionSearch,
  type SessionSearchDeps,
} from "./createSessionSearch.ts";
import { isGoogleRedirect, resolveResultLinks } from "./resolveResultLinks.ts";

const fixture = readFileSync(
  resolve(
    import.meta.dirname,
    "../../parser/fixtures/google/best-crm-tools-for-small-businesses.html",
  ),
  "utf8",
);

const session: GoogleSession = {
  id: "session-1",
  cookie: "NID=1",
  headers: { "user-agent": "Chrome/145" },
  createdAt: 0,
};

const job: GoogleSearchJob = {
  query: "best crm",
  country: "US",
  language: "en",
  pages: 1,
  includeHtml: false,
  resolveLinks: true,
  browserOnly: false,
  taskId: null,
};

const results = {
  url: "https://www.google.com/search?q=x",
  status: 200,
  html: fixture,
};
const captcha = {
  url: "https://www.google.com/sorry/index",
  status: 429,
  html: "",
};
const browserResult: SearchOutcome = { ok: false, reason: "captcha" };

const createDeps = () => ({
  pickSession: vi.fn<SessionSearchDeps["pickSession"]>(async () => session),
  recordUse: vi.fn<SessionSearchDeps["recordUse"]>(async () => undefined),
  discardSession: vi.fn<SessionSearchDeps["discardSession"]>(
    async () => undefined,
  ),
  fetchPages: vi.fn<SessionSearchDeps["fetchPages"]>(async () => [results]),
  resolveRedirect: vi.fn<SessionSearchDeps["resolveRedirect"]>(
    async () => null,
  ),
  fallback: vi.fn<SessionSearchDeps["fallback"]>(async () => browserResult),
});

describe("createSessionSearch", () => {
  it("answers from a session without touching the browser", async () => {
    const deps = createDeps();
    const outcome = await createSessionSearch(deps)(job);

    expect(outcome).toMatchObject({ ok: true, pages: 1, html: null });
    expect(outcome.ok && outcome.result.organicResults).toHaveLength(7);
    expect(deps.recordUse).toHaveBeenCalledWith("session-1");
    expect(deps.fallback).not.toHaveBeenCalled();
  });

  it("returns the first page's HTML when asked", async () => {
    const outcome = await createSessionSearch(createDeps())({
      ...job,
      includeHtml: true,
    });

    expect(outcome.ok && outcome.html).toBe(fixture);
  });

  it("goes straight to the browser for a browser-only job", async () => {
    const deps = createDeps();
    await createSessionSearch(deps)({ ...job, browserOnly: true });

    expect(deps.pickSession).not.toHaveBeenCalled();
    expect(deps.fallback).toHaveBeenCalledWith({ ...job, browserOnly: true });
  });

  it("falls back to the browser when no session is ready", async () => {
    const deps = createDeps();
    deps.pickSession.mockResolvedValue(null);

    expect(await createSessionSearch(deps)(job)).toBe(browserResult);
    expect(deps.fallback).toHaveBeenCalledWith({ ...job, browserOnly: true });
  });

  it("retires a blocked session and falls back", async () => {
    const deps = createDeps();
    deps.fetchPages.mockResolvedValue([captcha]);

    expect(await createSessionSearch(deps)(job)).toBe(browserResult);
    expect(deps.discardSession).toHaveBeenCalledWith("session-1");
    expect(deps.recordUse).not.toHaveBeenCalled();
  });

  it("keeps the session but falls back when the network fails", async () => {
    const deps = createDeps();
    deps.fetchPages.mockRejectedValue(new Error("socket hang up"));

    expect(await createSessionSearch(deps)(job)).toBe(browserResult);
    expect(deps.discardSession).not.toHaveBeenCalled();
  });

  it("skips link lookups when the caller does not want them", async () => {
    const deps = createDeps();
    await createSessionSearch(deps)({ ...job, resolveLinks: false });

    expect(deps.resolveRedirect).not.toHaveBeenCalled();
  });
});

describe("resolveResultLinks", () => {
  const result = (links: string[]): GoogleSearchResult => ({
    organicResults: links.map((link, index) => ({
      position: index + 1,
      title: `t${index}`,
      link,
      snippet: "",
      page: 1,
    })),
    peopleAlsoAsk: [],
    relatedSearches: [],
    knowledgePanel: null,
  });

  it("replaces Google redirect links with their destination", async () => {
    const resolved = await resolveResultLinks(
      result([
        "https://www.google.com/goto?url=CAES1",
        "https://example.com/already-real",
      ]),
      async (link) => (link.endsWith("CAES1") ? "https://crm.org/best" : null),
    );

    expect(resolved.organicResults.map(({ link }) => link)).toEqual([
      "https://crm.org/best",
      "https://example.com/already-real",
    ]);
  });

  it("keeps the redirect link when a lookup fails", async () => {
    const resolved = await resolveResultLinks(
      result(["https://www.google.com/goto?url=CAES1"]),
      async () => {
        throw new Error("timeout");
      },
    );

    expect(resolved.organicResults[0]?.link).toBe(
      "https://www.google.com/goto?url=CAES1",
    );
  });

  it("recognises only Google redirect links", () => {
    expect(isGoogleRedirect("https://www.google.com/goto?url=x")).toBe(true);
    expect(isGoogleRedirect("https://www.google.com/url?q=x")).toBe(true);
    expect(isGoogleRedirect("https://www.google.com/search?q=x")).toBe(false);
    expect(isGoogleRedirect("https://evil.com/goto?url=x")).toBe(false);
    expect(isGoogleRedirect("not a link")).toBe(false);
  });
});
