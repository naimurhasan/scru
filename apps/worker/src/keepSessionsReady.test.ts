import type { GoogleSession } from "@scru/core";
import { describe, expect, it, vi } from "vitest";
import { topUpSessions } from "./keepSessionsReady.ts";

const session = (id: string): GoogleSession => ({
  id,
  cookie: "NID=1",
  headers: {},
  createdAt: 0,
});

describe("topUpSessions", () => {
  it("harvests only the sessions that are missing", async () => {
    const add = vi.fn(async () => undefined);
    const harvest = vi
      .fn()
      .mockResolvedValueOnce(session("a"))
      .mockResolvedValueOnce(session("b"));

    const added = await topUpSessions({
      target: 3,
      size: async () => 1,
      harvest,
      add,
    });

    expect(added).toBe(2);
    expect(harvest).toHaveBeenCalledTimes(2);
    expect(add).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the pool is full", async () => {
    const harvest = vi.fn();
    const added = await topUpSessions({
      target: 2,
      size: async () => 2,
      harvest,
      add: vi.fn(),
    });

    expect(added).toBe(0);
    expect(harvest).not.toHaveBeenCalled();
  });

  it("stops after a failed harvest instead of hammering Google", async () => {
    const harvest = vi.fn(async () => null);
    const added = await topUpSessions({
      target: 3,
      size: async () => 0,
      harvest,
      add: vi.fn(),
    });

    expect(added).toBe(0);
    expect(harvest).toHaveBeenCalledTimes(1);
  });
});
