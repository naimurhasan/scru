import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { prettyJson } from "@/lib/format/prettyJson";
import type { FetchResult } from "@/lib/playground/readFetchResult";

const escapeAttribute = (value: string) => value.replaceAll('"', "&quot;");

export function FetchPreview({ result }: { result: FetchResult }) {
  if (result.data)
    return (
      <CodeBlock
        code={prettyJson(result.data)}
        label="Extracted data"
        language="json"
      />
    );

  const content = result.content ?? "";

  if (result.output === "screenshot")
    return (
      <div className="max-h-[36rem] overflow-auto rounded-lg border">
        <img
          src={`data:image/png;base64,${content}`}
          alt={`Screenshot of ${result.url}`}
          className="w-full"
        />
      </div>
    );

  if (result.output === "html")
    return (
      <iframe
        title={`Preview of ${result.url}`}
        sandbox=""
        srcDoc={`<base href="${escapeAttribute(result.url)}">${content}`}
        className="h-[36rem] w-full rounded-lg border bg-white"
      />
    );

  return (
    <CodeBlock
      code={content}
      label={result.output === "markdown" ? "Markdown" : "Text"}
    />
  );
}
