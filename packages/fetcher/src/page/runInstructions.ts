import type { InstructionReport, JsInstruction } from "@scru/core";
import type { Page } from "playwright-core";

const STEP_TIMEOUT_MS = 10_000;
const SETTLE_TIMEOUT_MS = 5_000;

const perform = async (tab: Page, instruction: JsInstruction) => {
  const timeout = STEP_TIMEOUT_MS;
  if ("click" in instruction) return tab.click(instruction.click, { timeout });
  if ("fill" in instruction)
    return tab.fill(instruction.fill.selector, instruction.fill.value, {
      timeout,
    });
  if ("select" in instruction)
    return tab.selectOption(
      instruction.select.selector,
      instruction.select.value,
      { timeout },
    );
  if ("press" in instruction) return tab.keyboard.press(instruction.press);
  if ("wait" in instruction) return tab.waitForTimeout(instruction.wait);
  if ("waitFor" in instruction)
    return tab.waitForSelector(instruction.waitFor, { timeout });
  return tab.mouse.wheel(0, instruction.scrollY);
};

export const runInstructions = async (
  tab: Page,
  instructions: JsInstruction[],
): Promise<InstructionReport[]> => {
  const reports: InstructionReport[] = [];
  for (const instruction of instructions) {
    const startedAt = Date.now();
    const error = await perform(tab, instruction).then(
      () => null,
      (failure: unknown) =>
        failure instanceof Error ? failure.message.split("\n")[0] : "failed",
    );
    reports.push({
      instruction,
      ok: error === null,
      durationMs: Date.now() - startedAt,
      error: error ?? null,
    });
  }
  if (instructions.length > 0)
    await tab
      .waitForLoadState("load", { timeout: SETTLE_TIMEOUT_MS })
      .catch(() => undefined);
  return reports;
};
