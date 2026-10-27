"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  sendFetch,
  sendGoogleSearch,
} from "@/app/dashboard/playground/actions";
import { FetchFields } from "@/components/playground/FetchFields";
import { GoogleSearchFields } from "@/components/playground/GoogleSearchFields";
import { PlaygroundForm } from "@/components/playground/PlaygroundForm";
import { PlaygroundResult } from "@/components/playground/PlaygroundResult";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";
import { toFetchBody } from "@/lib/playground/toFetchBody";
import type {
  Engine,
  FetchRequest,
  GoogleSearchRequest,
  PlaygroundRun,
} from "@/lib/playground/types";

const INITIAL_SEARCH: GoogleSearchRequest = {
  query: "best crm tools for small businesses",
  country: "US",
  pages: 1,
};

const INITIAL_FETCH: FetchRequest = {
  url: "https://books.toscrape.com/",
  output: "markdown",
  jsRender: false,
  waitFor: "",
  premiumProxy: false,
  country: "",
};

const NOTES: Record<Engine, string> = {
  google:
    "The first page costs 5 credits and each extra page 2. Results usually arrive in about a second. Failed requests are free.",
  fetch:
    "A page costs 1 credit, 5 with JavaScript rendering, 10 with a premium proxy and 25 with both. Failed requests are free.",
};

export function Playground({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [engine, setEngine] = useState<Engine>("google");
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [fetchRequest, setFetchRequest] = useState(INITIAL_FETCH);
  const [run, setRun] = useState<PlaygroundRun | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () =>
    startTransition(async () => {
      setRun(
        engine === "google"
          ? {
              engine,
              request: search,
              response: await sendGoogleSearch(search),
            }
          : {
              engine,
              request: fetchRequest,
              response: await sendFetch(fetchRequest),
            },
      );
      router.refresh();
    });

  const curlSnippet =
    engine === "google"
      ? buildCurlSnippet(apiUrl, "/v1/monitor/google", search)
      : buildCurlSnippet(apiUrl, "/v1/fetch", toFetchBody(fetchRequest));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <PlaygroundForm
        engine={engine}
        pending={pending}
        note={NOTES[engine]}
        onEngineChange={setEngine}
        onSubmit={send}
      >
        {engine === "google" ? (
          <GoogleSearchFields request={search} onChange={setSearch} />
        ) : (
          <FetchFields request={fetchRequest} onChange={setFetchRequest} />
        )}
      </PlaygroundForm>
      <PlaygroundResult run={run} pending={pending} curlSnippet={curlSnippet} />
    </div>
  );
}
