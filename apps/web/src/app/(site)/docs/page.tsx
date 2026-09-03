import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { DocsSection } from "@/components/docs/DocsSection";
import { FieldTable } from "@/components/docs/FieldTable";
import { SEARCH_RESULT_FIELDS } from "@/lib/docs/docFields";
import { EXAMPLE_RESPONSE } from "@/lib/docs/examples";
import { env } from "@/lib/env";
import { prettyJson } from "@/lib/format/prettyJson";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";

export const metadata: Metadata = { title: "Quickstart" };

export default function QuickstartPage() {
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Quickstart</h1>
        <p className="mt-3 text-muted-foreground">
          Get a key and turn a Google search into JSON in a few minutes.
        </p>
      </header>

      <DocsSection id="create-a-key" title="1. Create a key">
        <p>
          <Link href="/sign-up" className="underline">
            Create an account
          </Link>
          , open <strong>API keys</strong> in the dashboard and create a key. It
          is shown once, so copy it into an environment variable:
        </p>
        <CodeBlock code="export SCRU_API_KEY=scru_…" label="Shell" />
      </DocsSection>

      <DocsSection id="first-request" title="2. Send your first request">
        <CodeBlock
          label="Request"
          code={buildCurlSnippet(env.API_URL, {
            query: "best crm tools for small businesses",
            country: "US",
            pages: 1,
          })}
        />
        <p>
          A search usually answers in about 15 seconds and costs 5 credits.
          Failed requests are free.
        </p>
      </DocsSection>

      <DocsSection id="read-the-response" title="3. Read the response">
        <CodeBlock
          code={prettyJson(EXAMPLE_RESPONSE)}
          label="Response"
          language="json"
        />
        <FieldTable fields={SEARCH_RESULT_FIELDS} />
        <p>
          Next, see every option in the{" "}
          <Link href="/docs/reference" className="underline">
            API reference
          </Link>
          , or queue searches with{" "}
          <Link href="/docs/reference#async-tasks" className="underline">
            async tasks
          </Link>{" "}
          and receive them by{" "}
          <Link href="/docs/reference#webhooks" className="underline">
            webhook
          </Link>
          .
        </p>
      </DocsSection>
    </>
  );
}
