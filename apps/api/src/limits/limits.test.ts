import { describe, expect, it } from "vitest";
import { actor, createDeps, errorOf, search, send } from "../testSupport.ts";

describe("rate limit", () => {
  it("reports the limit on every authenticated response", async () => {
    const response = await search(createDeps(), { query: "best crm" });

    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
  });

  it("rejects a request over the limit before doing any work", async () => {
    const deps = createDeps();
    deps.limits.takeRateSlot.mockResolvedValue({
      allowed: false,
      limit: 10,
      remaining: 0,
    });
    const response = await search(deps, { query: "best crm" });
    const error = await errorOf(response);

    expect(response.status).toBe(429);
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.details).toEqual({ limit: 10 });
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(deps.limits.acquireConcurrency).not.toHaveBeenCalled();
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });

  it("counts per workspace and applies to task routes too", async () => {
    const deps = createDeps();
    deps.limits.takeRateSlot.mockResolvedValue({
      allowed: false,
      limit: 10,
      remaining: 0,
    });
    const response = await send(deps, "POST", "/v1/async/task", {
      taskType: "GOOGLE",
      payload: { query: "best crm" },
    });

    expect(response.status).toBe(429);
    expect(deps.limits.takeRateSlot).toHaveBeenCalledWith(actor.workspaceId);
    expect(deps.createTask).not.toHaveBeenCalled();
  });

  it("does not spend a slot on an unauthenticated request", async () => {
    const deps = createDeps();
    await search(deps, { query: "best crm" }, {});

    expect(deps.limits.takeRateSlot).not.toHaveBeenCalled();
  });
});

describe("concurrency limit", () => {
  it("reserves a slot for a sync search and frees it afterwards", async () => {
    const deps = createDeps();
    const response = await search(deps, { query: "best crm" });

    expect(response.headers.get("X-Concurrency-Limit")).toBe("2");
    expect(response.headers.get("X-Concurrency-Current")).toBe("1");
    expect(response.headers.get("X-Concurrency-Remaining")).toBe("1");
    expect(deps.limits.acquireConcurrency).toHaveBeenCalledWith(
      actor.workspaceId,
      actor.concurrencyLimit,
    );
    expect(deps.limits.releaseConcurrency).toHaveBeenCalledTimes(1);
  });

  it("rejects a search when every slot is busy", async () => {
    const deps = createDeps();
    deps.limits.acquireConcurrency.mockResolvedValue({
      acquired: false,
      limit: 2,
      current: 2,
    });
    const response = await search(deps, { query: "best crm" });
    const error = await errorOf(response);

    expect(response.status).toBe(429);
    expect(error.code).toBe("CONCURRENCY_LIMIT_REACHED");
    expect(response.headers.get("X-Concurrency-Remaining")).toBe("0");
    expect(deps.searchGoogle).not.toHaveBeenCalled();
    expect(deps.limits.releaseConcurrency).not.toHaveBeenCalled();
  });

  it("frees the slot when the search fails", async () => {
    const deps = createDeps();
    deps.searchGoogle.mockResolvedValue({ ok: false, reason: "captcha" });
    await search(deps, { query: "best crm" });

    expect(deps.limits.releaseConcurrency).toHaveBeenCalledTimes(1);
  });

  it("frees the slot when the search crashes", async () => {
    const deps = createDeps();
    deps.searchGoogle.mockRejectedValue(new Error("boom"));
    const response = await search(deps, { query: "best crm" });

    expect(response.status).toBe(500);
    expect(deps.limits.releaseConcurrency).toHaveBeenCalledTimes(1);
  });

  it("does not reserve a slot for an invalid body", async () => {
    const deps = createDeps();
    await search(deps, { query: "" });

    expect(deps.limits.acquireConcurrency).not.toHaveBeenCalled();
  });

  it("does not reserve a slot for an async task", async () => {
    const deps = createDeps();
    await send(deps, "POST", "/v1/async/task", {
      taskType: "GOOGLE",
      payload: { query: "best crm" },
    });

    expect(deps.limits.acquireConcurrency).not.toHaveBeenCalled();
  });
});
