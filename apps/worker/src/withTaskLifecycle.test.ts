import {
  toTaskSettlement,
  type GoogleSearchJob,
  type SearchOutcome,
} from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { withTaskLifecycle, type TaskHooks } from "./withTaskLifecycle.ts";

const found: SearchOutcome = {
  ok: true,
  html: null,
  pages: 1,
  result: {
    organicResults: [],
    peopleAlsoAsk: [],
    relatedSearches: [],
    knowledgePanel: null,
  },
};

const job = (taskId: string | null): { data: GoogleSearchJob } => ({
  data: {
    query: "best crm",
    country: "US",
    language: "en",
    pages: 1,
    includeHtml: false,
    resolveLinks: true,
    browserOnly: false,
    taskId,
  },
});

const createHooks = () => ({
  markProcessing: vi.fn<TaskHooks["markProcessing"]>(async () => undefined),
  settle: vi.fn<TaskHooks["settle"]>(async () => ({ deliveryId: null })),
  enqueueDelivery: vi.fn<TaskHooks["enqueueDelivery"]>(async () => undefined),
});

describe("withTaskLifecycle", () => {
  it("leaves a sync search untouched", async () => {
    const hooks = createHooks();
    const process = withTaskLifecycle(
      async () => found,
      toTaskSettlement,
      hooks,
    );

    expect(await process(job(null))).toBe(found);
    expect(hooks.markProcessing).not.toHaveBeenCalled();
    expect(hooks.settle).not.toHaveBeenCalled();
  });

  it("marks a task as processing before searching, then settles it", async () => {
    const hooks = createHooks();
    const order: string[] = [];
    hooks.markProcessing.mockImplementation(async () => {
      order.push("processing");
    });
    hooks.settle.mockImplementation(async () => {
      order.push("settled");
      return { deliveryId: null };
    });
    const process = withTaskLifecycle(
      async () => {
        order.push("search");
        return found;
      },
      toTaskSettlement,
      hooks,
    );

    await process(job("task-1"));

    expect(order).toEqual(["processing", "search", "settled"]);
    expect(hooks.settle).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ ok: true, cost: 3 }),
    );
  });

  it("settles a blocked search as a failure", async () => {
    const hooks = createHooks();
    const process = withTaskLifecycle(
      async (): Promise<SearchOutcome> => ({ ok: false, reason: "captcha" }),
      toTaskSettlement,
      hooks,
    );

    await process(job("task-1"));

    expect(hooks.settle).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ ok: false, errorCode: "FETCH_FAILED" }),
    );
  });

  it("queues a webhook when settling planned one", async () => {
    const hooks = createHooks();
    hooks.settle.mockResolvedValue({ deliveryId: "delivery-1" });

    await withTaskLifecycle(
      async () => found,
      toTaskSettlement,
      hooks,
    )(job("task-1"));

    expect(hooks.enqueueDelivery).toHaveBeenCalledWith("delivery-1");
  });

  it("does not queue a webhook when the task was already settled", async () => {
    const hooks = createHooks();
    hooks.settle.mockResolvedValue(null);

    await withTaskLifecycle(
      async () => found,
      toTaskSettlement,
      hooks,
    )(job("task-1"));

    expect(hooks.enqueueDelivery).not.toHaveBeenCalled();
  });

  it("fails the task instead of leaving it processing when the search crashes", async () => {
    const hooks = createHooks();
    const process = withTaskLifecycle(
      async () => {
        throw new Error("browser died");
      },
      toTaskSettlement,
      hooks,
    );

    await expect(process(job("task-1"))).rejects.toThrow("browser died");
    expect(hooks.settle).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ ok: false, errorCode: "INTERNAL_ERROR" }),
    );
  });
});
