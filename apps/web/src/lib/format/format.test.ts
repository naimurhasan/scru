import { describe, expect, it } from "vitest";
import { formatDuration } from "./formatDuration";
import { formatSuccessRate } from "./formatSuccessRate";
import { startOfToday } from "./startOfToday";

describe("formatDuration", () => {
  it("shows short durations in milliseconds", () => {
    expect(formatDuration(850)).toBe("850 ms");
  });

  it("shows longer durations in seconds", () => {
    expect(formatDuration(13_171)).toBe("13.2 s");
  });
});

describe("formatSuccessRate", () => {
  it("shows a rounded percentage", () => {
    expect(formatSuccessRate(2, 3)).toBe("67%");
  });

  it("shows a dash before the first request", () => {
    expect(formatSuccessRate(0, 0)).toBe("—");
  });
});

describe("startOfToday", () => {
  it("drops the time of day", () => {
    const start = startOfToday(new Date(2026, 9, 13, 16, 45, 12));
    expect(start).toEqual(new Date(2026, 9, 13));
  });
});
