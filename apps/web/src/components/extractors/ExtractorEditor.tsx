"use client";

import { useState, useTransition } from "react";
import { saveExtractorFieldsAction } from "@/app/dashboard/extractors/actions";
import { PageTypeFields } from "@/components/extractors/PageTypeFields";
import { Button } from "@/components/ui/button";
import type { ExtractorField, PageType } from "@/lib/extractors/types";

type ExtractorEditorProps = {
  id: string;
  pageTypes: PageType[];
};

export function ExtractorEditor({ id, pageTypes }: ExtractorEditorProps) {
  const [fields, setFields] = useState<ExtractorField[][]>(() =>
    pageTypes.map((pageType) => pageType.fields),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setError((await saveExtractorFieldsAction(id, fields)).error);
    });

  return (
    <div className="grid gap-6">
      {pageTypes.map((pageType, index) => (
        <PageTypeFields
          key={pageType.pattern}
          pageType={pageType}
          fields={fields[index] ?? []}
          onChange={(changed) =>
            setFields(
              fields.map((current, at) => (at === index ? changed : current)),
            )
          }
        />
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={pending} onClick={save}>
          {pending ? "Saving…" : "Save as new version"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Requests to this site use the newest version.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
