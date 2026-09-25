import type { Metadata } from "next";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { DocsSection } from "@/components/docs/DocsSection";
import { FieldTable } from "@/components/docs/FieldTable";
import {
  ERROR_CODES,
  LIMIT_HEADERS,
  SEARCH_REQUEST_FIELDS,
  SEARCH_RESULT_FIELDS,
  TASK_REQUEST_FIELDS,
} from "@/lib/docs/docFields";
import {
  buildTaskCurl,
  EXAMPLE_TASK,
  VERIFY_SIGNATURE,
} from "@/lib/docs/examples";
import { env } from "@/lib/env";
import { prettyJson } from "@/lib/format/prettyJson";

export const metadata: Metadata = { title: "API reference" };

const ERROR_EXAMPLE = {
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "The request is invalid",
    details: [
      {
        field: "query",
        message: "Too small: expected string to have >=1 characters",
      },
    ],
    timestamp: "2026-10-13T12:14:01.885Z",
  },
};

export default function ReferencePage() {
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">API reference</h1>
        <p className="mt-3 text-muted-foreground">
          Base URL <code className="font-mono text-sm">{env.API_URL}</code>. The
          full OpenAPI document is at{" "}
          <a href={`${env.API_URL}/openapi.json`} className="underline">
            /openapi.json
          </a>
          .
        </p>
      </header>

      <DocsSection id="authentication" title="Authentication">
        <p>
          Send your key on every request. A key gives full access to its
          workspace; revoke it from the dashboard if it leaks.
        </p>
        <CodeBlock code="Authorization: Bearer scru_…" label="Header" />
      </DocsSection>

      <DocsSection id="google-search" title="Google search">
        <CodeBlock code="POST /v1/monitor/google" label="Endpoint" />
        <p>
          Runs the search and answers when the results are ready, usually in
          about a second.
        </p>
        <h3 className="font-medium">Body</h3>
        <FieldTable fields={SEARCH_REQUEST_FIELDS} />
        <h3 className="font-medium">Result</h3>
        <FieldTable fields={SEARCH_RESULT_FIELDS} />
      </DocsSection>

      <DocsSection id="async-tasks" title="Async tasks">
        <CodeBlock
          label="Endpoints"
          code={["POST /v1/async/task", "GET  /v1/async/task/{taskId}"].join(
            "\n",
          )}
        />
        <p>
          Queue a search and get a task back at once with status 202. Poll it,
          or let a webhook tell you when it is done. Statuses move from{" "}
          <code>QUEUED</code> to <code>PROCESSING</code> to{" "}
          <code>COMPLETED</code> or <code>FAILED</code>. Credits are checked
          when you queue and charged when the task completes.
        </p>
        <FieldTable fields={TASK_REQUEST_FIELDS} />
        <CodeBlock code={buildTaskCurl(env.API_URL)} label="Request" />
        <CodeBlock
          code={prettyJson(EXAMPLE_TASK)}
          label="Response"
          language="json"
        />
      </DocsSection>

      <DocsSection id="webhooks" title="Webhooks">
        <p>
          When a task finishes we send <code>POST</code> to its webhook with{" "}
          <code>{"{ event, task }"}</code>. The event is{" "}
          <code>task.completed</code> or <code>task.failed</code> and the task
          has the same shape as the polling endpoint. Answer with any 2xx
          status. Anything else is retried up to five times with growing delays.
          Redirects are not followed.
        </p>
        <p>
          Each request carries <code>X-Scru-Signature: t=…,v1=…</code>. Check it
          with the signing secret from the Webhooks page:
        </p>
        <CodeBlock code={VERIFY_SIGNATURE} label="Node.js" />
      </DocsSection>

      <DocsSection id="errors" title="Errors">
        <p>
          Every error has the same shape. Branch on <code>code</code>, not on
          the message.
        </p>
        <CodeBlock
          code={prettyJson(ERROR_EXAMPLE)}
          label="Error"
          language="json"
        />
        <FieldTable fields={ERROR_CODES} />
      </DocsSection>

      <DocsSection id="limits" title="Limits">
        <p>
          Each workspace can send 10 requests a second and run 2 sync searches
          at once. Over either limit the answer is 429. Async tasks wait in a
          queue and do not use a sync slot, so they are the way to send many
          searches.
        </p>
        <FieldTable fields={LIMIT_HEADERS} />
      </DocsSection>
    </>
  );
}
