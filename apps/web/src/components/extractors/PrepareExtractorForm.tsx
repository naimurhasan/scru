"use client";

import { useActionState } from "react";
import { prepareExtractorAction } from "@/app/dashboard/extractors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_PREPARE_FORM_STATE } from "@/lib/extractors/prepareFormState";

export function PrepareExtractorForm() {
  const [state, action, pending] = useActionState(
    prepareExtractorAction,
    INITIAL_PREPARE_FORM_STATE,
  );

  return (
    <form action={action} className="grid gap-2">
      <Label htmlFor="url">Site address</Label>
      <div className="flex items-center gap-3">
        <Input
          id="url"
          name="url"
          type="url"
          required
          maxLength={2_000}
          placeholder="https://books.toscrape.com/"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Starting…" : "Prepare"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        scru studies up to 16 pages of the site, finds its page types and writes
        the fields for each. It takes a few minutes and costs 1 credit per page
        studied plus 20.
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.submitted && (
        <p role="status" className="text-sm text-muted-foreground">
          Preparing. It appears below when it is ready.
        </p>
      )}
    </form>
  );
}
