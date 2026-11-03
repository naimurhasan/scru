import { describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright-core";
import { passPressAndHold } from "./passPressAndHold.ts";

type Box = { x: number; y: number; width: number; height: number };

type TabStub = Page & {
  moves: Array<{ x: number; y: number }>;
  events: string[];
};

const createTab = (behavior: {
  initialBox: Box | null;
  disappearAfterDowns?: number;
  moveOnceBy?: { x: number; y: number };
}): TabStub => {
  let box: Box | null = behavior.initialBox
    ? { ...behavior.initialBox }
    : null;
  let downs = 0;
  let moved = false;
  const moves: Array<{ x: number; y: number }> = [];
  const events: string[] = [];
  const widget = {
    isVisible: async () => box !== null,
    boundingBox: async () => box && { ...box },
  };
  const tab = {
    moves,
    events,
    mouse: {
      move: async (x: number, y: number) => {
        moves.push({ x, y });
      },
      down: async () => {
        events.push("down");
        downs += 1;
        if (
          behavior.disappearAfterDowns !== undefined &&
          downs >= behavior.disappearAfterDowns
        )
          box = null;
      },
      up: async () => {
        events.push("up");
      },
    },
    locator: (_selector: string): Locator =>
      ({
        first: () => widget,
        count: async () => (box === null ? 0 : 1),
      }) as unknown as Locator,
    waitForTimeout: async () => {},
    url: () => "https://example.com/search?q=x",
  };
  if (behavior.moveOnceBy) {
    const originalDown = tab.mouse.down.bind(tab.mouse);
    tab.mouse.down = async () => {
      await originalDown();
      if (!moved && box) {
        box = {
          ...box,
          x: box.x + (behavior.moveOnceBy?.x ?? 0),
          y: box.y + (behavior.moveOnceBy?.y ?? 0),
        };
        moved = true;
      }
    };
  }
  return tab as unknown as TabStub;
};

const FAST = {
  holdTimeoutMs: 300,
  boxPollMs: 10,
  tremorMinMs: 0,
  tremorMaxMs: 1,
};

const BOX: Box = { x: 300, y: 200, width: 48, height: 48 };

describe("passPressAndHold", () => {
  it("returns absent when widget is missing", async () => {
    const tab = createTab({ initialBox: null });
    await expect(passPressAndHold(tab, FAST)).resolves.toBe("absent");
  });

  it("solves when the widget disappears while holding", async () => {
    const tab = createTab({ initialBox: BOX, disappearAfterDowns: 1 });
    await expect(passPressAndHold(tab, FAST)).resolves.toBe("solved");
    expect(tab.events[0]).toBe("down");
    expect(tab.events.at(-1)).toBe("up");
  });

  it("follows the widget when it escapes while holding", async () => {
    const tab = createTab({
      initialBox: BOX,
      disappearAfterDowns: 2,
      moveOnceBy: { x: 40, y: 0 },
    });
    await expect(
      passPressAndHold(tab, { ...FAST, attempts: 2 }),
    ).resolves.toBe("solved");
    const xs = tab.moves.map((point) => point.x);
    expect(Math.max(...xs)).toBeGreaterThan(340);
  });

  it("fails after exhausting attempts", async () => {
    const tab = createTab({ initialBox: BOX });
    await expect(
      passPressAndHold(tab, { ...FAST, attempts: 2, tremorMinMs: 0 }),
    ).resolves.toBe("failed");
    expect(tab.events.filter((event) => event === "down")).toHaveLength(2);
  });

  it("keeps tremor moves inside the widget box", async () => {
    const tab = createTab({
      initialBox: BOX,
      disappearAfterDowns: 1,
    });
    await passPressAndHold(tab, FAST);
    const holdMoves = tab.moves.filter(
      (point) => point.x >= 298 && point.x <= 350,
    );
    expect(holdMoves.length).toBeGreaterThan(0);
  });
});
