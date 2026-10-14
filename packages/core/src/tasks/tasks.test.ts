import { describe, expect, it } from "vitest";
import type { SearchOutcome } from "../search/types.ts";
import { toTaskSettlement } from "./toTaskSettlement.ts";
import { toTaskView } from "./toTaskView.ts";
import type { TaskRecord } from "./types.ts";

const result = {
  organicResults: [],
  peopleAlsoAsk: [],
  relatedSearches: [],
  knowledgePanel: null,
};

const task: TaskRecord = {
  id: "task-1",
  taskType: "GOOGLE",
  status: "QUEUED",
  payload: { query: "best crm" },
  result: null,
  errorCode: null,
  errorMessage: null,
  creditsCharged: 0,
  createdAt: new Date("2026-10-13T10:00:00.000Z"),
  startedAt: null,
  completedAt: null,
};

describe("toTaskView", () => {
  it("shows a queued task with empty result and error", () => {
    expect(toTaskView(task)).toEqual({
      id: "task-1",
      taskType: "GOOGLE",
      status: "QUEUED",
      payload: { query: "best crm" },
      result: null,
      error: null,
      creditsCharged: 0,
      createdAt: "2026-10-13T10:00:00.000Z",
      startedAt: null,
      completedAt: null,
    });
  });

  it("shows the error of a failed task", () => {
    const view = toTaskView({
      ...task,
      status: "FAILED",
      errorCode: "FETCH_FAILED",
      errorMessage: "Google could not be fetched (captcha)",
      completedAt: new Date("2026-10-13T10:00:20.000Z"),
    });
    expect(view.error).toEqual({
      code: "FETCH_FAILED",
      message: "Google could not be fetched (captcha)",
    });
    expect(view.completedAt).toBe("2026-10-13T10:00:20.000Z");
  });
});

describe("toTaskSettlement", () => {
  it("charges the async price for a successful search", () => {
    const outcome: SearchOutcome = { ok: true, result, html: null, pages: 1 };
    expect(toTaskSettlement(outcome)).toEqual({
      ok: true,
      result,
      loggedResult: result,
      cost: 3,
    });
  });

  it("adds two credits for every extra page that was fetched", () => {
    const outcome: SearchOutcome = { ok: true, result, html: null, pages: 3 };
    expect(toTaskSettlement(outcome)).toMatchObject({ cost: 7 });
  });

  it("keeps the raw page in the result but out of the log", () => {
    const outcome: SearchOutcome = {
      ok: true,
      result,
      html: "<html></html>",
      pages: 1,
    };
    const settlement = toTaskSettlement(outcome);
    expect(settlement).toMatchObject({
      result: { ...result, html: "<html></html>" },
      loggedResult: result,
    });
  });

  it("turns a blocked fetch into a failure that costs nothing", () => {
    expect(toTaskSettlement({ ok: false, reason: "captcha" })).toEqual({
      ok: false,
      errorCode: "FETCH_FAILED",
      errorMessage: "Google could not be fetched (captcha)",
      httpStatus: 502,
    });
  });
});
