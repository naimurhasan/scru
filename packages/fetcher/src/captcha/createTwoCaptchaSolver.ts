import { setTimeout as delay } from "node:timers/promises";

export type RecaptchaTask = {
  pageUrl: string;
  siteKey: string;
  dataS: string | null;
};

export type RecaptchaSolver = (task: RecaptchaTask) => Promise<string | null>;

type TwoCaptchaAnswer = {
  errorId: number;
  taskId?: number;
  status?: "processing" | "ready";
  solution?: { gRecaptchaResponse: string };
};

const API = "https://api.2captcha.com";
const POLL_MS = 5_000;
const MAX_WAIT_MS = 90_000;

const call = async (path: string, body: unknown): Promise<TwoCaptchaAnswer> => {
  const response = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as TwoCaptchaAnswer;
};

export const createTwoCaptchaSolver =
  (apiKey: string): RecaptchaSolver =>
  async ({ pageUrl, siteKey, dataS }) => {
    const created = await call("createTask", {
      clientKey: apiKey,
      task: {
        type: "RecaptchaV2TaskProxyless",
        websiteURL: pageUrl,
        websiteKey: siteKey,
        ...(dataS && { recaptchaDataSValue: dataS }),
      },
    });
    if (created.errorId !== 0 || created.taskId === undefined) return null;

    const deadline = Date.now() + MAX_WAIT_MS;
    while (Date.now() < deadline) {
      await delay(POLL_MS);
      const result = await call("getTaskResult", {
        clientKey: apiKey,
        taskId: created.taskId,
      });
      if (result.errorId !== 0) return null;
      if (result.status === "ready")
        return result.solution?.gRecaptchaResponse ?? null;
    }
    return null;
  };
