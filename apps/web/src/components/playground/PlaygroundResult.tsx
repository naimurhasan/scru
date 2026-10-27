import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { EmptyTab } from "@/components/playground/EmptyTab";
import { FetchPreview } from "@/components/playground/preview/FetchPreview";
import { SearchPreview } from "@/components/playground/preview/SearchPreview";
import { ResponseMeta } from "@/components/playground/ResponseMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prettyJson } from "@/lib/format/prettyJson";
import { readFetchResult } from "@/lib/playground/readFetchResult";
import { readSearchResult } from "@/lib/playground/readSearchResult";
import type { PlaygroundRun } from "@/lib/playground/types";

type PlaygroundResultProps = {
  run: PlaygroundRun | null;
  pending: boolean;
  curlSnippet: string;
};

const WAITING = "Waiting for the response…";
const NOTHING_SENT = "Send a request to see the response here.";
const NO_PREVIEW = "There is nothing to preview for this response.";

const previewOf = (run: PlaygroundRun) => {
  if (run.engine === "fetch") {
    const result = readFetchResult(run.response.body);
    return result && <FetchPreview result={result} />;
  }
  const result = readSearchResult(run.response.body);
  return result && <SearchPreview query={run.request.query} result={result} />;
};

export function PlaygroundResult({
  run,
  pending,
  curlSnippet,
}: PlaygroundResultProps) {
  const finished = pending ? null : run;
  const preview = finished ? previewOf(finished) : null;
  const emptyMessage = pending ? WAITING : NOTHING_SENT;

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="json">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            {finished && <ResponseMeta response={finished.response} />}
          </div>
          <TabsContent value="json">
            {finished ? (
              <CodeBlock
                code={prettyJson(finished.response.body)}
                label="Response"
                language="json"
              />
            ) : (
              <EmptyTab message={emptyMessage} />
            )}
          </TabsContent>
          <TabsContent value="preview">
            {preview ?? (
              <EmptyTab message={finished ? NO_PREVIEW : emptyMessage} />
            )}
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock code={curlSnippet} label="curl" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
