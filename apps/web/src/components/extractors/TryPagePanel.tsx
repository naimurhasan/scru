"use client";

import { useState, useTransition } from "react";
import { sendExtract } from "@/app/dashboard/search/actions";
import { ExtractPreview } from "@/components/playground/preview/ExtractPreview";
import { UrlField } from "@/components/playground/UrlField";
import { Button } from "@/components/ui/button";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import {
  type ExtractResult,
  readExtractResult,
} from "@/lib/playground/readExtractResult";

type Outcome =
  { result: ExtractResult; error: null } | { result: null; error: string };

export function TryPagePanel({ host }: { host: string }) {
  const [url, setUrl] = useState(`https://${host}/`);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () =>
    startTransition(async () => {
      const response = await sendExtract({ url });
      const result = readExtractResult(response.body);
      setOutcome(
        result
          ? { result, error: null }
          : { result: null, error: readErrorMessage(response.body) },
      );
    });

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <UrlField
          value={url}
          placeholder={`https://${host}/`}
          onChange={setUrl}
        />
        <Button type="submit" disabled={pending} className="justify-self-start">
          {pending ? "Extracting…" : "Extract this page"}
        </Button>
      </form>
      {outcome?.error && (
        <p role="alert" className="text-sm text-destructive">
          {outcome.error}
        </p>
      )}
      {outcome?.result && <ExtractPreview result={outcome.result} />}
    </div>
  );
}
