"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendPlaygroundRequest } from "@/app/dashboard/playground/actions";
import { PlaygroundForm } from "@/components/playground/PlaygroundForm";
import { PlaygroundResult } from "@/components/playground/PlaygroundResult";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";
import type { PlaygroundRequest, PlaygroundRun } from "@/lib/playground/types";

const INITIAL_REQUEST: PlaygroundRequest = {
  query: "best crm tools for small businesses",
  country: "US",
  pages: 1,
};

export function Playground({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [request, setRequest] = useState(INITIAL_REQUEST);
  const [run, setRun] = useState<PlaygroundRun | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () =>
    startTransition(async () => {
      setRun({ request, response: await sendPlaygroundRequest(request) });
      router.refresh();
    });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <PlaygroundForm
        request={request}
        pending={pending}
        onChange={setRequest}
        onSubmit={send}
      />
      <PlaygroundResult
        run={run}
        pending={pending}
        curlSnippet={buildCurlSnippet(apiUrl, request)}
      />
    </div>
  );
}
