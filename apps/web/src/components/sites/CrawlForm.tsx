"use client";

import { useActionState } from "react";
import { startCrawlAction } from "@/app/dashboard/crawl/actions";
import { FormError } from "@/components/sites/FormError";
import { OutputSelect } from "@/components/sites/OutputSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_CRAWL_FORM_STATE } from "@/lib/extractors/crawlFormState";

export function CrawlForm() {
  const [state, action, pending] = useActionState(
    startCrawlAction,
    INITIAL_CRAWL_FORM_STATE,
  );

  return (
    <Card>
      <CardContent>
        <form action={action} className="grid items-start gap-5 sm:grid-cols-3">
          <div className="grid gap-2 sm:col-span-full">
            <Label htmlFor="url">Start from</Label>
            <Input
              id="url"
              name="url"
              type="url"
              required
              maxLength={2_000}
              defaultValue="https://books.toscrape.com/"
            />
          </div>
          <OutputSelect />
          <div className="grid gap-2">
            <Label htmlFor="limit">Pages</Label>
            <Input
              id="limit"
              name="limit"
              type="number"
              required
              min={1}
              max={500}
              defaultValue={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxDepth">Link depth</Label>
            <Input
              id="maxDepth"
              name="maxDepth"
              type="number"
              required
              min={0}
              max={5}
              defaultValue={2}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-full">
            <Button type="submit" disabled={pending}>
              {pending ? "Starting…" : "Start crawl"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Follows links on the same site. Each page costs the same as a
              Fetch, charged when the crawl finishes.
            </p>
          </div>
          <div className="sm:col-span-full">
            <FormError message={state.error} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
