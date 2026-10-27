import type { Metadata } from "next";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { DocsSection } from "@/components/docs/DocsSection";
import { FieldTable } from "@/components/docs/FieldTable";
import {
  CRAWL_PAGE_FIELDS,
  CRAWL_REQUEST_FIELDS,
  ERROR_CODES,
  FETCH_INSTRUCTIONS,
  FETCH_PRICES,
  FETCH_REQUEST_FIELDS,
  FETCH_RESULT_FIELDS,
  LIMIT_HEADERS,
  SEARCH_REQUEST_FIELDS,
  SEARCH_RESULT_FIELDS,
  TASK_REQUEST_FIELDS,
} from "@/lib/docs/docFields";
import {
  buildCrawlPagesCurl,
  buildFetchQuery,
  buildTaskCurl,
  CRAWL_EXAMPLE_BODY,
  EXAMPLE_TASK,
  FETCH_EXAMPLE_BODY,
  FETCH_EXAMPLE_RESPONSE,
  FETCH_INSTRUCTIONS_EXAMPLE,
  VERIFY_SIGNATURE,
} from "@/lib/docs/examples";
import { env } from "@/lib/env";
import { prettyJson } from "@/lib/format/prettyJson";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";

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

      <DocsSection id="fetch" title="Fetch">
        <CodeBlock
          code={["POST /v1/fetch", "GET  /v1/fetch?url=…"].join("\n")}
          label="Endpoints"
        />
        <p>
          Fetches any public page and returns it as HTML, Markdown, plain text,
          a screenshot, or JSON picked out with CSS selectors. Pages that block
          automated visitors are retried automatically, and nothing is charged
          if the page cannot be fetched.
        </p>
        <h3 className="font-medium">Body</h3>
        <FieldTable fields={FETCH_REQUEST_FIELDS} />
        <CodeBlock
          code={buildCurlSnippet(env.API_URL, "/v1/fetch", FETCH_EXAMPLE_BODY)}
          label="Request"
        />
        <CodeBlock
          code={prettyJson(FETCH_EXAMPLE_RESPONSE)}
          label="Response"
          language="json"
        />
        <h3 className="font-medium">Result</h3>
        <FieldTable fields={FETCH_RESULT_FIELDS} />
        <h3 className="font-medium">Query string</h3>
        <p>
          <code>GET /v1/fetch</code> takes the same fields as query parameters.
          Send booleans as <code>true</code> or <code>false</code>, and{" "}
          <code>cssExtractor</code> and <code>jsInstructions</code> as JSON.
        </p>
        <CodeBlock code={buildFetchQuery(env.API_URL)} label="Request" />
        <h3 className="font-medium">Price</h3>
        <FieldTable fields={FETCH_PRICES} />
      </DocsSection>

      <DocsSection id="page-instructions" title="Page instructions">
        <p>
          With <code>jsRender</code>, <code>jsInstructions</code> runs up to 20
          steps on the page before it is read. Each step is an object with one
          key. Every step gets 10 seconds, and the result reports how each one
          went.
        </p>
        <FieldTable fields={FETCH_INSTRUCTIONS} />
        <CodeBlock
          code={prettyJson(FETCH_INSTRUCTIONS_EXAMPLE)}
          label="jsInstructions"
          language="json"
        />
      </DocsSection>

      <DocsSection id="crawl" title="Crawl">
        <CodeBlock
          label="Endpoints"
          code={[
            "POST /v1/crawl",
            "GET  /v1/async/task/{taskId}",
            "GET  /v1/crawl/{taskId}/pages?after=…&limit=…",
          ].join("\n")}
        />
        <p>
          Starts at a page, follows its links on the same site and collects
          every page it reaches. A crawl runs in the background as a task: poll
          it or wait for its webhook, then read the pages. It respects the
          site&apos;s robots.txt and pauses between pages.
        </p>
        <h3 className="font-medium">Body</h3>
        <FieldTable fields={CRAWL_REQUEST_FIELDS} />
        <CodeBlock
          code={buildCurlSnippet(env.API_URL, "/v1/crawl", CRAWL_EXAMPLE_BODY)}
          label="Request"
        />
        <h3 className="font-medium">Pages</h3>
        <p>
          Pages come back in the order they were visited, up to 50 at a time.
          While <code>nextCursor</code> is not null, pass it as{" "}
          <code>after</code> for the next batch. Pages are readable while the
          crawl is still running.
        </p>
        <CodeBlock code={buildCrawlPagesCurl(env.API_URL)} label="Request" />
        <FieldTable fields={CRAWL_PAGE_FIELDS} />
        <h3 className="font-medium">Price</h3>
        <p>
          Each fetched page costs what a Fetch with the same options costs, and
          the total is charged when the crawl finishes. To start, the workspace
          needs enough credits for <code>limit</code> pages.
        </p>
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
