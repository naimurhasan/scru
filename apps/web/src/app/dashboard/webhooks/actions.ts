"use server";

import { isPublicWebhookUrl, isWebhookUrl } from "@scru/core";
import { saveWebhookUrl } from "@scru/db";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { requireWorkspace } from "@/lib/requireWorkspace";
import type { WebhookFormState } from "@/lib/webhooks/webhookFormState";

const MAX_URL_LENGTH = 2_000;

const isAllowed = (url: string) =>
  url.length <= MAX_URL_LENGTH &&
  (env.WEBHOOK_ALLOW_PRIVATE === "true"
    ? isWebhookUrl(url)
    : isPublicWebhookUrl(url));

export const saveWebhookUrlAction = async (
  _previous: WebhookFormState,
  form: FormData,
): Promise<WebhookFormState> => {
  const { workspace } = await requireWorkspace();
  const url = String(form.get("url") ?? "").trim();
  if (url !== "" && !isAllowed(url))
    return {
      error: "Enter a public address that starts with http:// or https://.",
      saved: false,
    };
  await saveWebhookUrl(db, workspace.id, url === "" ? null : url);
  revalidatePath("/dashboard/webhooks");
  return { error: null, saved: true };
};
