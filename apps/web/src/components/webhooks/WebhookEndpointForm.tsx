"use client";

import { useActionState } from "react";
import { saveWebhookUrlAction } from "@/app/dashboard/webhooks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_WEBHOOK_FORM_STATE } from "@/lib/webhooks/webhookFormState";

export function WebhookEndpointForm({ url }: { url: string | null }) {
  const [state, action, pending] = useActionState(
    saveWebhookUrlAction,
    INITIAL_WEBHOOK_FORM_STATE,
  );

  return (
    <form action={action} className="grid gap-2">
      <Label htmlFor="url">Endpoint URL</Label>
      <div className="flex items-center gap-3">
        <Input
          id="url"
          name="url"
          type="url"
          key={url ?? ""}
          defaultValue={url ?? ""}
          placeholder="https://your-app.com/webhooks/scru"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Finished async tasks are sent here unless the task names its own
        webhook. Leave it empty to turn this off.
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-sm text-muted-foreground">
          Saved.
        </p>
      )}
    </form>
  );
}
