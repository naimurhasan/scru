import { describe, expect, it } from "vitest";
import { toQueuePriority } from "./toQueuePriority.ts";

describe("toQueuePriority", () => {
  it("gives the highest task priority the smallest queue number", () => {
    expect(toQueuePriority(10)).toBe(1);
    expect(toQueuePriority(1)).toBe(10);
  });

  it("keeps higher task priorities ahead of lower ones", () => {
    expect(toQueuePriority(7)).toBeLessThan(toQueuePriority(3));
  });
});
