"use client";

import { useActionState } from "react";
import { createApiKeyAction } from "@/app/dashboard/api-keys/actions";
import { NewKeyNotice } from "@/components/apiKeys/NewKeyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_CREATE_KEY_STATE } from "@/lib/apiKeys/createKeyState";

export function CreateApiKeyForm() {
  const [state, action, pending] = useActionState(
    createApiKeyAction,
    INITIAL_CREATE_KEY_STATE,
  );

  return (
    <div className="grid gap-4">
      <form action={action} className="flex items-end gap-3">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="name">New key name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Production server"
            required
            maxLength={60}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create key"}
        </Button>
      </form>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.key && <NewKeyNotice apiKey={state.key} />}
    </div>
  );
}
