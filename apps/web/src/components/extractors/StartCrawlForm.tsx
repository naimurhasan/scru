"use client";

import { useActionState } from "react";
import { startJsonCrawlAction } from "@/app/dashboard/extractors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_CRAWL_FORM_STATE } from "@/lib/extractors/crawlFormState";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 500;

export function StartCrawlForm({ host }: { host: string }) {
  const [state, action, pending] = useActionState(
    startJsonCrawlAction,
    INITIAL_CRAWL_FORM_STATE,
  );

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <div className="grid gap-2">
          <Label htmlFor="crawl-url">Start from</Label>
          <Input
            id="crawl-url"
            name="url"
            type="url"
            required
            maxLength={2_000}
            defaultValue={`https://${host}/`}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="crawl-limit">Pages</Label>
          <Input
            id="crawl-limit"
            name="limit"
            type="number"
            required
            min={1}
            max={MAX_LIMIT}
            defaultValue={DEFAULT_LIMIT}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "Starting…" : "Crawl as JSON"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Follows links two levels deep and returns every page as records. Each
        page costs the same as a Fetch.
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
