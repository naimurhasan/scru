import { describe, expect, it } from "vitest";
import { calculateCredits } from "./calculateCredits.ts";

describe("calculateCredits", () => {
  it("charges the base price for one async page", () => {
    expect(calculateCredits({ pages: 1, mode: "async" })).toBe(3);
  });

  it("adds the sync surcharge", () => {
    expect(calculateCredits({ pages: 1, mode: "sync" })).toBe(5);
  });

  it("adds two credits for every extra page", () => {
    expect(calculateCredits({ pages: 4, mode: "async" })).toBe(9);
    expect(calculateCredits({ pages: 4, mode: "sync" })).toBe(11);
  });

  it("never discounts below one page", () => {
    expect(calculateCredits({ pages: 0, mode: "async" })).toBe(3);
  });
});
