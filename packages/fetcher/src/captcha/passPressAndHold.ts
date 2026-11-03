import type { Page } from "playwright-core";

export type PressAndHoldResult = "absent" | "solved" | "failed";

export type PressAndHoldOptions = {
  attempts?: number;
  holdTimeoutMs?: number;
  boxPollMs?: number;
  tremorMinMs?: number;
  tremorMaxMs?: number;
};

const WIDGET = "#px-captcha";

const ATTEMPTS = 3;
const HOLD_TIMEOUTS_MS = [12_000, 18_000, 25_000];
const BOX_POLL_MS = 250;
const TREMOR_MIN_MS = 40;
const TREMOR_MAX_MS = 90;
const TREMOR_PX = 1.6;
const ESCAPE_PX = 6;
const RETRY_PAUSE_MS: [number, number] = [500, 1_200];
const SETTLE_MS = 400;

type Box = { x: number; y: number; width: number; height: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const aimPoint = (box: Box) => ({
  x: box.x + box.width * rand(0.35, 0.65),
  y: box.y + box.height * rand(0.35, 0.65),
});

const inside = (box: Box, x: number, y: number) =>
  x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;

const holdAttempt = async (
  tab: Page,
  holdTimeoutMs: number,
  boxPollMs: number,
  tremorMinMs: number,
  tremorMaxMs: number,
): Promise<boolean> => {
  const box = await tab.locator(WIDGET).first().boundingBox();
  if (!box) return true;

  const target = aimPoint(box);
  await tab.mouse.move(target.x, target.y);
  await sleep(rand(80, 240));
  await tab.mouse.down();

  let anchor = target;
  let nextBoxPoll = 0;
  const deadline = Date.now() + holdTimeoutMs;
  let solved = false;

  while (Date.now() < deadline) {
    if (Date.now() >= nextBoxPoll) {
      nextBoxPoll = Date.now() + boxPollMs;
      if ((await tab.locator(WIDGET).count()) === 0) {
        solved = true;
        break;
      }
      const current = await tab.locator(WIDGET).first().boundingBox();
      if (current) {
        const center = {
          x: current.x + current.width / 2,
          y: current.y + current.height / 2,
        };
        if (Math.hypot(center.x - anchor.x, center.y - anchor.y) > ESCAPE_PX) {
          const next = aimPoint(current);
          await tab.mouse.move(next.x, next.y);
          anchor = next;
          continue;
        }
        if (!inside(current, anchor.x, anchor.y)) {
          const next = aimPoint(current);
          await tab.mouse.move(next.x, next.y, { steps: 3 });
          anchor = next;
          continue;
        }
      }
    }
    anchor = {
      x: anchor.x + rand(-TREMOR_PX, TREMOR_PX),
      y: anchor.y + rand(-TREMOR_PX, TREMOR_PX),
    };
    await tab.mouse.move(anchor.x, anchor.y, { steps: 1 });
    await sleep(rand(tremorMinMs, tremorMaxMs));
  }

  await tab.mouse.up();
  if (!solved) return false;
  await sleep(SETTLE_MS);
  return (await tab.locator(WIDGET).count().catch(() => 0)) === 0;
};

export const passPressAndHold = async (
  tab: Page,
  options: PressAndHoldOptions = {},
): Promise<PressAndHoldResult> => {
  const {
    attempts = ATTEMPTS,
    holdTimeoutMs,
    boxPollMs = BOX_POLL_MS,
    tremorMinMs = TREMOR_MIN_MS,
    tremorMaxMs = TREMOR_MAX_MS,
  } = options;
  if (!(await tab.locator(WIDGET).first().isVisible().catch(() => false)))
    return "absent";

  for (let attempt = 0; attempt < attempts; attempt++) {
    const timeout = holdTimeoutMs ?? HOLD_TIMEOUTS_MS[attempt] ?? 25_000;
    if (await holdAttempt(tab, timeout, boxPollMs, tremorMinMs, tremorMaxMs))
      return "solved";
    await sleep(rand(...RETRY_PAUSE_MS));
  }
  return "failed";
};
