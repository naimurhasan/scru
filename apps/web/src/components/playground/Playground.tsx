"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendFetch, sendGoogleSearch } from "@/app/dashboard/search/actions";
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

type DirectEngine = Exclude<Engine, "extract">;

const NOTES: Record<DirectEngine, string> = {
  google:
    "The first page costs 5 credits and each extra page 2. Results usually arrive in about a second. Failed requests are free.",
  fetch:
    "A page costs 1 credit, 5 with JavaScript rendering, 10 with a premium proxy and 25 with both. Failed requests are free.",
};

type PlaygroundProps = {
  apiUrl: string;
  engine: DirectEngine;
};

export function Playground({ apiUrl, engine }: PlaygroundProps) {
  const router = useRouter();
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [fetchRequest, setFetchRequest] = useState(INITIAL_FETCH);
  const [run, setRun] = useState<PlaygroundRun | null>(null);
  const [pending, startTransition] = useTransition();

  const runEngine = async (): Promise<PlaygroundRun> => {
    if (engine === "google")
      return {
        engine,
        request: search,
        response: await sendGoogleSearch(search),
      };
    return {
      engine,
      request: fetchRequest,
      response: await sendFetch(fetchRequest),
    };
  };

  const send = () =>
    startTransition(async () => {
      setRun(await runEngine());
      router.refresh();
    });

  const curlSnippets: Record<DirectEngine, () => string> = {
    google: () => buildCurlSnippet(apiUrl, "/v1/monitor/google", search),
    fetch: () =>
      buildCurlSnippet(apiUrl, "/v1/fetch", toFetchBody(fetchRequest)),
  };

  return (
    <div className="grid gap-6">
      <PlaygroundForm pending={pending} note={NOTES[engine]} onSubmit={send}>
        {engine === "google" && (
          <GoogleSearchFields request={search} onChange={setSearch} />
        )}
        {engine === "fetch" && (
          <FetchFields request={fetchRequest} onChange={setFetchRequest} />
        )}
      </PlaygroundForm>
      <PlaygroundResult
        run={run}
        pending={pending}
        curlSnippet={curlSnippets[engine]()}
      />
    </div>
  );
}
