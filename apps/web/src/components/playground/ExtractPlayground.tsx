"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendExtract } from "@/app/dashboard/search/actions";
import { ExtractFields } from "@/components/playground/ExtractFields";
import { PlaygroundForm } from "@/components/playground/PlaygroundForm";
import { PlaygroundResult } from "@/components/playground/PlaygroundResult";
import { PreparedNotice } from "@/components/playground/PreparedNotice";
import { PreparingSite } from "@/components/playground/PreparingSite";
import {
  describePreparation,
  type Preparation,
} from "@/lib/extractors/describePreparation";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";
import { readPreparingTaskId } from "@/lib/playground/readPreparingTaskId";
import type { TaskState } from "@/lib/playground/readTaskState";
import type { ExtractRequest, PlaygroundRun } from "@/lib/playground/types";
import { useTaskWatch } from "@/lib/tasks/useTaskWatch";

const INITIAL_EXTRACT: ExtractRequest = {
  url: "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html",
};

const NOTE =
  "A page costs the same as a Fetch. The first request for a new site also pays for learning it. Failed requests are free.";

type Preparing = {
  taskId: string;
  request: ExtractRequest;
};

export function ExtractPlayground({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [request, setRequest] = useState(INITIAL_EXTRACT);
  const [run, setRun] = useState<PlaygroundRun | null>(null);
  const [preparing, setPreparing] = useState<Preparing | null>(null);
  const [prepared, setPrepared] = useState<Preparation | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const extract = (target: ExtractRequest) =>
    startTransition(async () => {
      const response = await sendExtract(target);
      const taskId = readPreparingTaskId(response.body);
      setPreparing(taskId === null ? null : { taskId, request: target });
      if (taskId === null)
        setRun({ engine: "extract", request: target, response });
      router.refresh();
    });

  useTaskWatch(preparing?.taskId ?? null, (state: TaskState) => {
    const target = preparing?.request;
    setPreparing(null);
    if (state.status === "FAILED" || !target) {
      setFailure(state.errorMessage ?? "This site could not be learned.");
      return;
    }
    setPrepared(describePreparation(state));
    extract(target);
  });

  const send = () => {
    setFailure(null);
    setPrepared(null);
    extract(request);
  };

  return (
    <div className="grid gap-6">
      <PlaygroundForm
        pending={pending || preparing !== null}
        note={NOTE}
        onSubmit={send}
      >
        <ExtractFields request={request} onChange={setRequest} />
      </PlaygroundForm>
      {failure && (
        <p role="alert" className="text-sm text-destructive">
          {failure}
        </p>
      )}
      {prepared && <PreparedNotice preparation={prepared} />}
      {preparing ? (
        <PreparingSite host={new URL(preparing.request.url).hostname} />
      ) : (
        <PlaygroundResult
          run={run}
          pending={pending}
          curlSnippet={buildCurlSnippet(apiUrl, "/v1/extract", request)}
        />
      )}
    </div>
  );
}
