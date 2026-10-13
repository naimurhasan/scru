import type { SearchOutcome } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import type { ApiDeps } from "./deps.ts";
import type { ErrorBody } from "./errors/toErrorBody.ts";
import type { GoogleSearchResponse } from "./google/schemas.ts";

const apiKey = { apiKeyId: "key-1", workspaceId: "workspace-1", credits: 100 };
const config = { internalToken: "internal-token-for-tests-only" };
const workspaceId = "0b8f7a52-6c1d-4a0e-9d3b-2f4e5a6b7c8d";

const result: GoogleSearchResponse["result"] = {
  organicResults: [
    {
      position: 1,
      title: "Best CRM",
      link: "https://crm.org/best",
      snippet: "A guide",
      page: 1,
    },
  ],
  peopleAlsoAsk: [{ question: "What is a CRM?" }],
  relatedSearches: [{ query: "free crm" }],
  knowledgePanel: null,
};

const found: SearchOutcome = {
  ok: true,
  result,
  html: "<html>results</html>",
};

const createDeps = () => ({
  findApiKey: vi.fn<ApiDeps["findApiKey"]>(async () => apiKey),
  findWorkspaceActor: vi.fn<ApiDeps["findWorkspaceActor"]>(async () => ({
    ...apiKey,
    apiKeyId: null,
  })),
  chargeCredits: vi.fn<ApiDeps["chargeCredits"]>(async () => 95),
  recordRequest: vi.fn<ApiDeps["recordRequest"]>(async () => undefined),
  searchGoogle: vi.fn<ApiDeps["searchGoogle"]>(async () => found),
});

const search = (
  deps: ApiDeps,
  body: unknown,
  headers: Record<string, string> = { Authorization: "Bearer scru_test" },
) =>
  createApp(deps, config).request("/v1/monitor/google", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const errorOf = async (response: Response) =>
  ((await response.json()) as ErrorBody).error;

const successOf = async (response: Response) =>
  (await response.json()) as GoogleSearchResponse;

describe("POST /v1/monitor/google", () => {
  it("returns parsed results and charges on success", async () => {
    const deps = createDeps();
    const response = await search(deps, { query: "best crm", country: "us" });

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Credits-Charged")).toBe("5");
    expect(response.headers.get("X-Credits-Remaining")).toBe("95");
    expect(await successOf(response)).toEqual({ success: true, result });
    expect(deps.searchGoogle).toHaveBeenCalledWith({
      query: "best crm",
      country: "US",
      language: "en",
      includeHtml: false,
    });
    expect(deps.chargeCredits).toHaveBeenCalledWith("workspace-1", 5);
  });

  it("includes the raw page when asked", async () => {
    const response = await search(createDeps(), {
      query: "best crm",
      include: { html: true },
    });

    expect((await successOf(response)).result.html).toBe(
      "<html>results</html>",
    );
  });

  it("logs a successful request without the raw page", async () => {
    const deps = createDeps();
    await search(deps, { query: "best crm", include: { html: true } });

    expect(deps.recordRequest).toHaveBeenCalledTimes(1);
    const log = deps.recordRequest.mock.calls[0]?.[0];
    expect(log).toMatchObject({
      workspaceId: "workspace-1",
      apiKeyId: "key-1",
      engine: "google",
      httpStatus: 200,
      creditsCharged: 5,
    });
    expect(JSON.stringify(log?.response)).not.toContain("<html>");
  });

  it("rejects a request without a key", async () => {
    const deps = createDeps();
    const response = await search(deps, { query: "best crm" }, {});

    expect(response.status).toBe(401);
    expect((await errorOf(response)).code).toBe("UNAUTHORIZED");
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });

  it("rejects an unknown key", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue(null);
    const response = await search(deps, { query: "best crm" });

    expect(response.status).toBe(401);
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });

  it("rejects an invalid body and names the fields", async () => {
    const deps = createDeps();
    const response = await search(deps, { query: "", country: "USA" });
    const error = await errorOf(response);

    expect(response.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual([
      expect.objectContaining({ field: "query" }),
      expect.objectContaining({ field: "country" }),
    ]);
    expect(Date.parse(error.timestamp)).not.toBeNaN();
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await search(createDeps(), "{not json");

    expect(response.status).toBe(400);
    expect((await errorOf(response)).code).toBe("VALIDATION_ERROR");
  });

  it("refuses to search without enough credits", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...apiKey, credits: 4 });
    const response = await search(deps, { query: "best crm" });
    const error = await errorOf(response);

    expect(response.status).toBe(403);
    expect(error.code).toBe("INSUFFICIENT_CREDITS");
    expect(error.details).toEqual({ required: 5 });
    expect(deps.searchGoogle).not.toHaveBeenCalled();
    expect(deps.recordRequest.mock.calls[0]?.[0]).toMatchObject({
      httpStatus: 403,
      errorCode: "INSUFFICIENT_CREDITS",
      creditsCharged: 0,
    });
  });

  it("does not charge when Google blocks the fetch", async () => {
    const deps = createDeps();
    deps.searchGoogle.mockResolvedValue({ ok: false, reason: "captcha" });
    const response = await search(deps, { query: "best crm" });
    const error = await errorOf(response);

    expect(response.status).toBe(502);
    expect(error.code).toBe("FETCH_FAILED");
    expect(error.details).toEqual({ reason: "captcha" });
    expect(response.headers.get("X-Credits-Charged")).toBeNull();
    expect(deps.chargeCredits).not.toHaveBeenCalled();
    expect(deps.recordRequest.mock.calls[0]?.[0]).toMatchObject({
      httpStatus: 502,
      errorCode: "FETCH_FAILED",
      creditsCharged: 0,
    });
  });

  it("reports a timeout without charging", async () => {
    const deps = createDeps();
    deps.searchGoogle.mockResolvedValue({ ok: false, reason: "timeout" });
    const response = await search(deps, { query: "best crm" });

    expect(response.status).toBe(504);
    expect((await errorOf(response)).code).toBe("TIMEOUT");
    expect(deps.chargeCredits).not.toHaveBeenCalled();
  });

  it("fails when the balance ran out while the search was running", async () => {
    const deps = createDeps();
    deps.chargeCredits.mockResolvedValue(null);
    const response = await search(deps, { query: "best crm" });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).code).toBe("INSUFFICIENT_CREDITS");
  });

  it("hides unexpected failures behind a generic error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const deps = createDeps();
    deps.searchGoogle.mockRejectedValue(new Error("redis password leaked"));
    const response = await search(deps, { query: "best crm" });
    const error = await errorOf(response);

    expect(response.status).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(error)).not.toContain("redis");
  });
});

describe("dashboard requests", () => {
  const internal = (token: string, workspace: string) => ({
    "X-Internal-Token": token,
    "X-Workspace-Id": workspace,
  });

  it("runs a search for a workspace without an API key", async () => {
    const deps = createDeps();
    const response = await search(
      deps,
      { query: "best crm" },
      internal(config.internalToken, workspaceId),
    );

    expect(response.status).toBe(200);
    expect(deps.findWorkspaceActor).toHaveBeenCalledWith(workspaceId);
    expect(deps.findApiKey).not.toHaveBeenCalled();
    expect(deps.recordRequest.mock.calls[0]?.[0]).toMatchObject({
      apiKeyId: null,
      httpStatus: 200,
    });
  });

  it("rejects a wrong internal token", async () => {
    const deps = createDeps();
    const response = await search(
      deps,
      { query: "best crm" },
      internal("not-the-token", workspaceId),
    );

    expect(response.status).toBe(401);
    expect(deps.findWorkspaceActor).not.toHaveBeenCalled();
  });

  it("rejects a malformed workspace id before touching the database", async () => {
    const deps = createDeps();
    const response = await search(
      deps,
      { query: "best crm" },
      internal(config.internalToken, "1; drop table workspaces"),
    );

    expect(response.status).toBe(401);
    expect(deps.findWorkspaceActor).not.toHaveBeenCalled();
  });

  it("rejects an unknown workspace", async () => {
    const deps = createDeps();
    deps.findWorkspaceActor.mockResolvedValue(null);
    const response = await search(
      deps,
      { query: "best crm" },
      internal(config.internalToken, workspaceId),
    );

    expect(response.status).toBe(401);
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });
});

describe("other routes", () => {
  it("answers the health check without a key", async () => {
    const response = await createApp(createDeps(), config).request("/health");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns the error envelope for an unknown route", async () => {
    const response = await createApp(createDeps(), config).request("/nope");

    expect(response.status).toBe(404);
    expect((await errorOf(response)).code).toBe("NOT_FOUND");
  });

  it("publishes the OpenAPI document", async () => {
    const response = await createApp(createDeps(), config).request(
      "/openapi.json",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      paths: {
        "/v1/monitor/google": { post: { security: [{ bearerAuth: [] }] } },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
      },
    });
  });
});
