import { describe, expect, it } from "vitest";
import {
  actor,
  config,
  createDeps,
  errorOf,
  fetched,
  send,
} from "../testSupport.ts";
import type { FetchResponse } from "./schemas.ts";

const fetchPage = (deps: ReturnType<typeof createDeps>, body: unknown) =>
  send(deps, "POST", "/v1/fetch", body);

const resultOf = async (response: Response) =>
  ((await response.json()) as FetchResponse).result;

const url = "https://shop.example/deals";

describe("POST /v1/fetch", () => {
  it("returns the page HTML by default and charges one credit", async () => {
    const deps = createDeps();
    const response = await fetchPage(deps, { url });

    expect(response.status).toBe(200);
    expect(await resultOf(response)).toEqual({
      url,
      statusCode: 200,
      output: "html",
      content: fetched.page.html,
    });
    expect(response.headers.get("X-Credits-Charged")).toBe("1");
    expect(deps.fetchPage).toHaveBeenCalledWith({
      url,
      jsRender: false,
      instructions: [],
      waitFor: null,
      waitMs: 0,
      screenshot: false,
      blockResources: true,
      proxy: null,
    });
  });

  it("converts the page to Markdown", async () => {
    const response = await fetchPage(createDeps(), { url, output: "markdown" });

    expect((await resultOf(response)).content).toBe(
      "# Daily deals\n\n[Red chair](/p/1)",
    );
  });

  it("returns extracted fields instead of content", async () => {
    const response = await fetchPage(createDeps(), {
      url,
      cssExtractor: { title: "h1", links: "a.item @href" },
    });

    expect(await resultOf(response)).toEqual({
      url,
      statusCode: 200,
      data: { title: "Daily deals", links: "/p/1" },
    });
  });

  it("charges five credits for a rendered page", async () => {
    const deps = createDeps();
    const response = await fetchPage(deps, {
      url,
      jsRender: true,
      waitFor: "h1",
      wait: 500,
    });

    expect(response.headers.get("X-Credits-Charged")).toBe("5");
    expect(deps.chargeCredits).toHaveBeenCalledWith(actor.workspaceId, 5);
    expect(deps.fetchPage.mock.calls[0]?.[0]).toMatchObject({
      jsRender: true,
      waitFor: "h1",
      waitMs: 500,
    });
  });

  it("asks for a screenshot when that is the output", async () => {
    const deps = createDeps();
    await fetchPage(deps, { url, jsRender: true, output: "screenshot" });

    expect(deps.fetchPage.mock.calls[0]?.[0].screenshot).toBe(true);
  });

  it.each([
    [{ waitFor: "h1" }, "waitFor"],
    [{ wait: 1000 }, "wait"],
    [{ output: "screenshot" }, "output"],
  ])("refuses %j without jsRender", async (options, field) => {
    const deps = createDeps();
    const response = await fetchPage(deps, { url, ...options });

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field }),
    ]);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it.each([
    "http://localhost:3000/admin",
    "http://169.254.169.254/latest/meta-data",
    "http://192.168.1.1/",
    "ftp://shop.example/file",
    "not a url",
  ])("refuses the private or invalid address %s", async (target) => {
    const deps = createDeps();
    const response = await fetchPage(deps, { url: target });

    expect(response.status).toBe(400);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("refuses an invalid CSS selector", async () => {
    const response = await fetchPage(createDeps(), {
      url,
      cssExtractor: { title: "h1[" },
    });

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field: "cssExtractor.title" }),
    ]);
  });

  it("charges nothing and logs the reason when the page is blocked", async () => {
    const deps = createDeps();
    deps.fetchPage.mockResolvedValue({ ok: false, reason: "blocked" });
    const response = await fetchPage(deps, { url });

    expect(response.status).toBe(502);
    expect((await errorOf(response)).details).toEqual({ reason: "blocked" });
    expect(deps.chargeCredits).not.toHaveBeenCalled();
    expect(deps.recordRequest.mock.calls[0]?.[0]).toMatchObject({
      engine: "fetch",
      httpStatus: 502,
      errorCode: "FETCH_FAILED",
      creditsCharged: 0,
    });
  });

  it("answers 504 when the page does not load in time", async () => {
    const deps = createDeps();
    deps.fetchPage.mockResolvedValue({ ok: false, reason: "timeout" });

    expect((await fetchPage(deps, { url })).status).toBe(504);
  });

  it("refuses when the balance cannot cover a rendered page", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 4 });
    const response = await fetchPage(deps, { url, jsRender: true });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 5 });
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("logs the request without the page content", async () => {
    const deps = createDeps();
    await fetchPage(deps, { url });

    expect(deps.recordRequest.mock.calls[0]?.[0]).toMatchObject({
      engine: "fetch",
      httpStatus: 200,
      creditsCharged: 1,
      response: {
        success: true,
        result: { url, statusCode: 200, output: "html" },
      },
    });
    expect(
      JSON.stringify(deps.recordRequest.mock.calls[0]?.[0].response),
    ).not.toContain("Daily deals");
  });

  it.each([
    [{}, 10],
    [{ jsRender: true }, 25],
  ])(
    "charges a premium proxy fetch %j at %i credits",
    async (options, credits) => {
      const deps = createDeps();
      const response = await fetchPage(deps, {
        url,
        premiumProxy: true,
        ...options,
      });

      expect(response.headers.get("X-Credits-Charged")).toBe(String(credits));
    },
  );

  it("passes the country and session to the fetch", async () => {
    const deps = createDeps();
    await fetchPage(deps, { url, premiumProxy: true, country: "gb" });
    await fetchPage(deps, {
      url,
      premiumProxy: true,
      sessionId: "checkout-42",
    });

    expect(deps.fetchPage.mock.calls.map(([job]) => job.proxy)).toEqual([
      { country: "GB", sessionId: null },
      { country: null, sessionId: "checkout-42" },
    ]);
  });

  it.each([
    [{ country: "US" }, "country"],
    [{ sessionId: "s1" }, "sessionId"],
    [{ premiumProxy: true, country: "US", sessionId: "s1" }, "sessionId"],
    [{ premiumProxy: true, country: "USA" }, "country"],
  ])("refuses the proxy options %j", async (options, field) => {
    const deps = createDeps();
    const response = await fetchPage(deps, { url, ...options });

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field }),
    ]);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("refuses a premium proxy when no proxy account is set up", async () => {
    const deps = createDeps();
    const response = await send(
      deps,
      "POST",
      "/v1/fetch",
      { url, premiumProxy: true },
      undefined,
      { ...config, proxiesEnabled: false },
    );

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field: "premiumProxy" }),
    ]);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("passes page instructions and returns their report", async () => {
    const deps = createDeps();
    const instructions = [
      { fill: { selector: "#q", value: "lamp" } },
      { press: "Enter" },
      { waitFor: ".results" },
    ];
    const report = instructions.map((instruction) => ({
      instruction,
      ok: true,
      durationMs: 12,
      error: null,
    }));
    deps.fetchPage.mockResolvedValue({
      ok: true,
      page: { ...fetched.page, instructions: report },
    });
    const response = await fetchPage(deps, {
      url,
      jsRender: true,
      jsInstructions: instructions,
    });

    expect(deps.fetchPage.mock.calls[0]?.[0].instructions).toEqual(
      instructions,
    );
    expect((await resultOf(response)).instructions).toEqual(report);
  });

  it.each([
    [[{ click: "button" }], false],
    [[{ hover: "button" }], true],
    [[{ click: "a", wait: 5 }], true],
    [[{ wait: 60_000 }], true],
  ])("validates the instructions %j", async (jsInstructions, refused) => {
    const response = await fetchPage(createDeps(), {
      url,
      jsRender: true,
      jsInstructions,
    });

    expect(response.status).toBe(refused ? 400 : 200);
  });

  it("refuses instructions without jsRender", async () => {
    const response = await fetchPage(createDeps(), {
      url,
      jsInstructions: [{ click: "button" }],
    });

    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field: "jsInstructions" }),
    ]);
  });
});

describe("GET /v1/fetch", () => {
  const query = (params: Record<string, string>) =>
    `/v1/fetch?${new URLSearchParams(params)}`;

  it("reads every option from the query string", async () => {
    const deps = createDeps();
    const response = await send(
      deps,
      "GET",
      query({
        url,
        jsRender: "true",
        wait: "500",
        output: "markdown",
        jsInstructions: JSON.stringify([{ click: "#more" }]),
        premiumProxy: "true",
        country: "de",
      }),
    );

    expect(response.status).toBe(200);
    expect((await resultOf(response)).output).toBe("markdown");
    expect(deps.fetchPage.mock.calls[0]?.[0]).toMatchObject({
      url,
      jsRender: true,
      waitMs: 500,
      instructions: [{ click: "#more" }],
      proxy: { country: "DE", sessionId: null },
    });
    expect(response.headers.get("X-Credits-Charged")).toBe("25");
  });

  it("reads a CSS extractor given as JSON", async () => {
    const response = await send(
      createDeps(),
      "GET",
      query({ url, cssExtractor: JSON.stringify({ title: "h1" }) }),
    );

    expect((await resultOf(response)).data).toEqual({ title: "Daily deals" });
  });

  it.each([
    [{ url, jsRender: "yes" }, "jsRender"],
    [{ url, wait: "soon", jsRender: "true" }, "wait"],
    [{ url, cssExtractor: "{not json" }, "cssExtractor"],
    [{ url: "http://localhost/" }, "url"],
  ])("refuses %j", async (params, field) => {
    const deps = createDeps();
    const response = await send(deps, "GET", query(params));

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field }),
    ]);
    expect(deps.fetchPage).not.toHaveBeenCalled();
  });

  it("needs a url", async () => {
    const response = await send(createDeps(), "GET", "/v1/fetch");

    expect(response.status).toBe(400);
  });
});
