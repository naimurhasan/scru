import { describe, expect, it } from "vitest";
import { queuedTask } from "../testSupport.ts";
import { pickPendingPreparation } from "./pickPendingPreparation.ts";

const preparation = (status: string, url: unknown) => ({
  ...queuedTask,
  taskType: "EXTRACTOR",
  status,
  payload: { url },
});

describe("pickPendingPreparation", () => {
  it("picks a queued or running preparation of the same host", () => {
    const running = preparation("PROCESSING", "https://shop.example/");
    expect(
      pickPendingPreparation(
        [preparation("QUEUED", "https://other.example/"), running],
        "shop.example",
      ),
    ).toBe(running);
  });

  it("ignores finished preparations", () => {
    expect(
      pickPendingPreparation(
        [
          preparation("COMPLETED", "https://shop.example/"),
          preparation("FAILED", "https://shop.example/"),
        ],
        "shop.example",
      ),
    ).toBeNull();
  });

  it("ignores a payload without an address", () => {
    expect(
      pickPendingPreparation([preparation("QUEUED", 42)], "shop.example"),
    ).toBeNull();
  });
});
