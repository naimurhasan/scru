import { describe, expect, it } from "vitest";
import { readPreparingTaskId } from "./readPreparingTaskId";
import { readTaskState } from "./readTaskState";

describe("readPreparingTaskId", () => {
  it("returns the task of a site that is being prepared", () => {
    expect(
      readPreparingTaskId({
        success: true,
        status: "PREPARING",
        task: { id: "t-1" },
      }),
    ).toBe("t-1");
  });

  it("returns null for an extracted page", () => {
    expect(readPreparingTaskId({ success: true, result: {} })).toBeNull();
  });
});

describe("readTaskState", () => {
  it("reads the status, result and error message", () => {
    expect(
      readTaskState({
        success: true,
        task: {
          status: "FAILED",
          payload: { url: "https://a.example/" },
          result: null,
          error: { code: "PREPARATION_FAILED", message: "No fields" },
        },
      }),
    ).toEqual({
      status: "FAILED",
      payload: { url: "https://a.example/" },
      result: null,
      errorMessage: "No fields",
    });
  });

  it("returns null for an error body", () => {
    expect(readTaskState({ success: false })).toBeNull();
  });
});
