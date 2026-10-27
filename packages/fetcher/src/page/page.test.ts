import type { FetchJob, PageOutcome } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import type { FetchedPage } from "../types.ts";
import { createFetchPage, type FetchPageDeps } from "./createFetchPage.ts";
import { detectChallenge } from "./detectChallenge.ts";

const page = (status: number, html: string): FetchedPage => ({
  url: "https://shop.example/deals",
  status,
  html,
});

describe("detectChallenge", () => {
  it("passes an ordinary page", () => {
    expect(detectChallenge(page(200, "<h1>Deals</h1>"))).toBeNull();
  });

  it("passes a not-found page, which is the site's own answer", () => {
    expect(detectChallenge(page(404, "<h1>Not found</h1>"))).toBeNull();
  });

  it("passes a page that only embeds a CAPTCHA in a form", () => {
    expect(
      detectChallenge(
        page(200, '<form><div class="g-recaptcha"></div></form>'),
      ),
    ).toBeNull();
  });

  it("spots the Cloudflare interstitial even with status 200", () => {
    expect(detectChallenge(page(200, "<title>Just a moment...</title>"))).toBe(
      "cloudflare",
    );
  });

  it.each([
    [
      403,
      '<script src="https://challenges.cloudflare.com/x"></script>',
      "cloudflare",
    ],
    [
      403,
      '<iframe src="https://geo.captcha-delivery.com/captcha/"></iframe>',
      "datadome",
    ],
    [429, '<div class="g-recaptcha"></div>', "captcha"],
    [503, "<h1>Service unavailable</h1>", "blocked_status"],
  ])("names a blocked %i page", (status, html, reason) => {
    expect(detectChallenge(page(status, html))).toBe(reason);
  });
});

const job: FetchJob = {
  url: "https://shop.example/deals",
  jsRender: false,
  instructions: [],
  waitFor: null,
  waitMs: 0,
  screenshot: false,
  blockResources: true,
  proxy: null,
};

const rendered: PageOutcome = {
  ok: true,
  page: { ...page(200, "<h1>Rendered</h1>"), screenshot: null, instructions: [] },
};

const createDeps = () => ({
  fetchHttp: vi.fn<FetchPageDeps["fetchHttp"]>(async () =>
    page(200, "<h1>Deals</h1>"),
  ),
  render: vi.fn<FetchPageDeps["render"]>(async () => rendered),
});

describe("createFetchPage", () => {
  it("answers over plain HTTP when the page is not blocked", async () => {
    const deps = createDeps();
    const outcome = await createFetchPage(deps)(job);

    expect(outcome).toEqual({
      ok: true,
      page: { ...page(200, "<h1>Deals</h1>"), screenshot: null, instructions: [] },
    });
    expect(deps.render).not.toHaveBeenCalled();
  });

  it("sends plain HTTP through the requested proxy", async () => {
    const deps = createDeps();
    const proxy = { country: "GB", sessionId: null };
    await createFetchPage(deps)({ ...job, proxy });

    expect(deps.fetchHttp).toHaveBeenCalledWith(job.url, proxy);
  });

  it("renders straight away when jsRender is asked for", async () => {
    const deps = createDeps();
    const { jsRender: _jsRender, ...renderJob } = job;

    expect(await createFetchPage(deps)({ ...job, jsRender: true })).toBe(
      rendered,
    );
    expect(deps.fetchHttp).not.toHaveBeenCalled();
    expect(deps.render).toHaveBeenCalledWith(renderJob);
  });

  it("renders when plain HTTP is challenged", async () => {
    const deps = createDeps();
    deps.fetchHttp.mockResolvedValue(
      page(403, "<title>Just a moment...</title>"),
    );

    expect(await createFetchPage(deps)(job)).toBe(rendered);
  });

  it("renders when plain HTTP fails on the network", async () => {
    const deps = createDeps();
    deps.fetchHttp.mockRejectedValue(new Error("socket hang up"));

    expect(await createFetchPage(deps)(job)).toBe(rendered);
  });
});
