"use client";

import { useActionState } from "react";
import { startBatchAction } from "@/app/dashboard/batch/actions";
import { FormError } from "@/components/sites/FormError";
import { OutputSelect } from "@/components/sites/OutputSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INITIAL_CRAWL_FORM_STATE } from "@/lib/extractors/crawlFormState";

const EXAMPLE_URLS = [
  "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html",
  "https://books.toscrape.com/catalogue/soumission_998/index.html",
  "https://books.toscrape.com/catalogue/sharp-objects_997/index.html",
].join("\n");

export function BatchForm() {
  const [state, action, pending] = useActionState(
    startBatchAction,
    INITIAL_CRAWL_FORM_STATE,
  );

  return (
    <Card>
      <CardContent>
        <form action={action} className="grid items-start gap-5 sm:grid-cols-3">
          <div className="grid gap-2 sm:col-span-full">
            <Label htmlFor="urls">Addresses, one per line</Label>
            <Textarea
              id="urls"
              name="urls"
              rows={6}
              required
              className="font-mono text-xs"
              defaultValue={EXAMPLE_URLS}
            />
          </div>
          <OutputSelect />
          <div className="flex flex-wrap items-center gap-4 sm:col-span-full">
            <Button type="submit" disabled={pending}>
              {pending ? "Starting…" : "Start batch"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Up to 1,000 addresses, from any sites. Each costs the same as a
              Fetch, charged when the batch finishes.
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
