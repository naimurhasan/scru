import type { PageOutcome, RenderJob } from "@scru/core";
import type { Page } from "playwright-core";
import type { BrowserProvider } from "../types.ts";
import { detectChallenge } from "./detectChallenge.ts";
import { runInstructions } from "./runInstructions.ts";

const SKIPPED_RESOURCES = new Set(["image", "media", "font"]);
const CHALLENGE_WAIT_MS = 15_000;
const CHALLENGE_POLL_MS = 1_000;

const isChallenged = async (tab: Page, status: number) => {
  const html = await tab.content().catch(() => null);
  return html === null || detectChallenge({ status, html }) !== null;
};

const waitOutChallenge = async (tab: Page, status: () => number) => {
  const deadline = Date.now() + CHALLENGE_WAIT_MS;
  while (await isChallenged(tab, status())) {
    if (Date.now() >= deadline) return false;
    await tab.waitForTimeout(CHALLENGE_POLL_MS);
  }
  return true;
};

const skipHeavyResources = (tab: Page) =>
  tab.route("**/*", (route) =>
    SKIPPED_RESOURCES.has(route.request().resourceType())
      ? route.abort()
      : route.continue(),
  );

export type RenderOptions = {
  timeoutMs: number;
  passCaptcha: ((tab: Page) => Promise<unknown>) | null;
};

export const renderPage = async (
  provider: BrowserProvider,
  job: RenderJob,
  { timeoutMs, passCaptcha }: RenderOptions,
): Promise<PageOutcome> => {
  const tab = await provider.openPage();
  let status = 0;
  tab.on("response", (response) => {
    if (
      response.request().isNavigationRequest() &&
      response.frame() === tab.mainFrame()
    )
      status = response.status();
  });
  try {
    if (job.blockResources) await skipHeavyResources(tab);
    await tab.goto(job.url, { waitUntil: "load", timeout: timeoutMs });
    if (passCaptcha && (await isChallenged(tab, status)))
      await passCaptcha(tab);
    if (!(await waitOutChallenge(tab, () => status)))
      return { ok: false, reason: "blocked" };
    const instructions = await runInstructions(tab, job.instructions);
    if (job.waitFor) {
      const found = await tab
        .waitForSelector(job.waitFor, { timeout: timeoutMs })
        .catch(() => null);
      if (!found) return { ok: false, reason: "selector_not_found" };
    }
    if (job.waitMs > 0) await tab.waitForTimeout(job.waitMs);
    return {
      ok: true,
      page: {
        url: tab.url(),
        status,
        html: await tab.content(),
        screenshot: job.screenshot
          ? (await tab.screenshot({ fullPage: true })).toString("base64")
          : null,
        instructions,
      },
    };
  } catch {
    return { ok: false, reason: "navigation_failed" };
  } finally {
    await tab.close();
  }
};
