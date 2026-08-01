import { describe, expect, it } from "vitest";
import {
  actor,
  createDeps,
  errorOf,
  found,
  search,
  send,
} from "../testSupport.ts";

describe("pages", () => {
  it("asks for one page by default", async () => {
    const deps = createDeps();
    await search(deps, { query: "best crm" });

    expect(deps.searchGoogle.mock.calls[0]?.[0].pages).toBe(1);
  });

  it("passes the requested page count to the search", async () => {
    const deps = createDeps();
    await search(deps, { query: "best crm", pages: 3 });

    expect(deps.searchGoogle.mock.calls[0]?.[0].pages).toBe(3);
  });

  it("charges for the pages that came back, not the pages asked for", async () => {
    const deps = createDeps();
    deps.searchGoogle.mockResolvedValue({ ...found, pages: 2 });
    const response = await search(deps, { query: "best crm", pages: 5 });

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Credits-Charged")).toBe("7");
    expect(deps.chargeCredits).toHaveBeenCalledWith(actor.workspaceId, 7);
  });

  it("refuses when the balance cannot cover every requested page", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 10 });
    const response = await search(deps, { query: "best crm", pages: 4 });
    const error = await errorOf(response);

    expect(response.status).toBe(403);
    expect(error.details).toEqual({ required: 11 });
    expect(deps.searchGoogle).not.toHaveBeenCalled();
  });

  it.each([0, 11, 1.5, "2"])("rejects pages = %s", async (pages) => {
    const deps = createDeps();
    const response = await search(deps, { query: "best crm", pages });

    expect(response.status).toBe(400);
    expect((await errorOf(response)).details).toEqual([
      expect.objectContaining({ field: "pages" }),
    ]);
  });

  it("estimates an async task by its requested pages", async () => {
    const deps = createDeps();
    deps.findApiKey.mockResolvedValue({ ...actor, credits: 6 });
    const response = await send(deps, "POST", "/v1/async/task", {
      taskType: "GOOGLE",
      payload: { query: "best crm", pages: 3 },
    });

    expect(response.status).toBe(403);
    expect((await errorOf(response)).details).toEqual({ required: 7 });
  });

  it("queues an async task with its page count", async () => {
    const deps = createDeps();
    await send(deps, "POST", "/v1/async/task", {
      taskType: "GOOGLE",
      payload: { query: "best crm", pages: 3 },
    });

    expect(deps.enqueueTask.mock.calls[0]?.[0].pages).toBe(3);
  });
});
