import type { Page } from "playwright-core";
import type { RecaptchaSolver } from "./createTwoCaptchaSolver.ts";

export type CaptchaResult = "absent" | "clicked" | "solved" | "failed";

const WIDGET = "[data-sitekey]";
const TOKEN_FIELD = "#g-recaptcha-response";
const CHECKBOX_FRAME = 'iframe[title="reCAPTCHA"]';
const PUZZLE_FRAME = 'iframe[title*="challenge"]';
const CLICK_TIMEOUT_MS = 5_000;
const TICK_WAIT_MS = 10_000;
const POLL_MS = 500;

const readToken = (page: Page) =>
  page
    .locator(TOKEN_FIELD)
    .first()
    .inputValue()
    .catch(() => "");

const clickCheckbox = async (page: Page): Promise<boolean> => {
  await page
    .frameLocator(CHECKBOX_FRAME)
    .first()
    .locator("#recaptcha-anchor")
    .click({ timeout: CLICK_TIMEOUT_MS });
  const deadline = Date.now() + TICK_WAIT_MS;
  while (Date.now() < deadline) {
    if (await readToken(page)) return true;
    if (await page.locator(PUZZLE_FRAME).first().isVisible()) return false;
    await page.waitForTimeout(POLL_MS);
  }
  return false;
};

const submitToken = async (page: Page, token: string) => {
  await page
    .locator(TOKEN_FIELD)
    .first()
    .evaluate((field, value) => {
      field.value = value;
    }, token);
  await page
    .locator(WIDGET)
    .first()
    .evaluate((widget, value) => {
      const callbackName = widget.getAttribute("data-callback");
      const callback = callbackName
        ? widget.ownerDocument.defaultView?.[callbackName]
        : undefined;
      if (typeof callback === "function") callback(value);
      else widget.closest("form")?.requestSubmit();
    }, token);
};

export const passRecaptcha = async (
  page: Page,
  solve: RecaptchaSolver | null,
): Promise<CaptchaResult> => {
  if ((await page.locator(CHECKBOX_FRAME).count()) === 0) return "absent";

  if (await clickCheckbox(page).catch(() => false)) {
    await submitToken(page, await readToken(page));
    return "clicked";
  }

  const widget = page.locator(WIDGET).first();
  const siteKey = await widget.getAttribute("data-sitekey");
  if (!solve || !siteKey) return "failed";
  const token = await solve({
    pageUrl: page.url(),
    siteKey,
    dataS: await widget.getAttribute("data-s"),
  });
  if (!token) return "failed";
  await submitToken(page, token);
  return "solved";
};
