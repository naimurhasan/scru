# scru — plan draft

Status: chapter 1 in progress. Steps 1 to 5 work end to end. Left in chapter 1: the public site and docs (step 6) and the fetcher gaps from step 2.

## Running it locally

```bash
pnpm db:up        # Postgres and Redis in Docker
pnpm db:migrate   # create the tables
pnpm db:seed      # once: a workspace with 500 credits, prints an API key
pnpm dev          # dashboard on http://localhost:3000, API on http://localhost:4000, plus the browser worker
```

```bash
curl -X POST http://localhost:4000/v1/monitor/google \
  -H "Authorization: Bearer <api key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "best crm tools for small businesses", "country": "US"}'
```

Open http://localhost:3000, create an account and use the playground; new accounts get their own workspace with 500 credits. For curl, create a key on the API keys page. The key from the first seed is saved as `SCRU_API_KEY` in `.env` and belongs to a separate local workspace. Copy `.env.example` to `.env` and fill in the two secrets before the first run. The OpenAPI document is at `/openapi.json`. Without the API, `pnpm serp "<query>" US` prints the same JSON from the terminal.

## Progress

| Step                    | State       | Notes                                                                                                                    |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1. Parser               | Done        | Organic results, People Also Ask questions, related searches, knowledge panel. Tested on two real pages                  |
| 2. Fetcher              | Mostly done | Live pages fetched from this machine with CloakBrowser, block detection, retries. Pagination, mobile and bake-off remain |
| 3. Sync API             | Done        | `POST /v1/monitor/google` with key auth, error envelope, credits charged on success only, request log, OpenAPI document  |
| 4. Dashboard            | Done        | Sign-up and sign-in, overview, playground, API keys, webhooks, logs                                                      |
| 5. Async                | Done        | Async tasks with polling, signed webhooks with retries, rate and concurrency limits, Webhooks page                       |
| 6. Public site and docs | Not started |                                                                                                                          |

What the first live runs showed (13 Oct 2026, one home connection, no proxy):

- **Headless with a direct search URL was blocked on the first request** with Google's CAPTCHA page.
- **Headed, opening the homepage and typing the query, passed 5 of 5 times.** This is now the only flow the fetcher uses.
- **Google hides result links.** Organic links are encrypted `/goto?url=…` redirects, so the real address is not in the page. The fetcher resolves each result title link through that redirect and writes the real address back into the page before saving it. This costs one small extra request per result.
- **Country works without a proxy.** Opening the homepage with `gl` and `hl` carries both into the search.
- **People Also Ask answers load only when a question is clicked.** The parser returns the questions; answers and their links need the fetcher to expand each one, which is not built.
- A browser window opens on screen during each fetch, because headed mode is required.

What step 3 settled:

- **Request:** `query`, `country` (default `US`) and `include.html`. `pages` and `device` are not accepted yet because the fetcher does not support them.
- **Cost:** 3 credits per search plus 2 for a sync request, so 5. Failed fetches and timeouts cost nothing.
- **Errors:** `VALIDATION_ERROR` 400, `UNAUTHORIZED` 401, `INSUFFICIENT_CREDITS` 403, `NOT_FOUND` 404, `INTERNAL_ERROR` 500, `FETCH_FAILED` 502, `TIMEOUT` 504.
- **Shape of the system:** the API puts every search on a Redis queue and waits for it; a separate worker owns the browser and runs one search at a time. Async endpoints in step 5 reuse that queue.
- **Ownership:** keys, credits and logs belong to a workspace. Sign-in users will be attached to workspaces in step 4.
- First live request through the API: 200 in 13 seconds, 8 organic results, 5 credits charged.

What step 4 settled:

- **Accounts:** email and password with Better Auth. Signing up creates a workspace with 500 credits owned by that user.
- **Playground path:** the dashboard calls the same API endpoint as everyone else, authenticated by a shared internal token plus the workspace id, so playground requests are charged and logged like any other.
- **Keys:** shown once at creation, stored as a hash, revocable. A revoked key is rejected on the next request.
- **Pages read the database directly;** only the playground goes through the API.
- Checked in a real browser: sign-up, wrong password, sign-out, key create and revoke, and a live playground search (200 in 14.9 seconds, 5 credits).

What step 5 settled:

- **Async tasks:** `POST /v1/async/task` takes `taskType`, `payload`, and optional `priority` (1 to 10), `idempotencyKey` and `webhook.url`, and answers 202 with a task. `GET /v1/async/task/{taskId}` returns its status: `QUEUED`, `PROCESSING`, `COMPLETED` or `FAILED`.
- **Cost:** 3 credits, checked at submission and charged when the task completes. A failed task costs nothing. Sync requests jump ahead of queued tasks.
- **Idempotency:** a repeated key in the same workspace answers 409 `CONFLICT`.
- **Webhooks:** sent to the task’s own URL, or else the workspace’s default from the Webhooks page. The body is `{ event, task }` with event `task.completed` or `task.failed`. Up to 5 attempts with growing delays; redirects are not followed.
- **Signature:** header `X-Scru-Signature: t=<unix time>,v1=<hex>`, the HMAC-SHA256 of `<time>.<body>` with the workspace’s signing secret.
- **Private addresses** (localhost, 10.x, 192.168.x, cloud metadata and similar) are refused as webhook targets unless `WEBHOOK_ALLOW_PRIVATE=true`, which the local `.env` sets so webhooks can be tested on this machine. It must be off on any public deployment. The check is by hostname only, so a public name that resolves to a private address is not caught yet.
- **Rate limit:** `RATE_LIMIT_PER_SECOND` (10) per workspace on every authenticated route, answering 429 `RATE_LIMITED` with `X-RateLimit-*` headers.
- **Concurrency limit:** 2 sync searches in flight per workspace (a column on the workspace), answering 429 `CONCURRENCY_LIMIT_REACHED` with `X-Concurrency-*` headers. Async tasks do not use a slot.
- **Where tasks finish:** the worker settles a task in one database transaction (status, credits, request log, planned webhook), so a restarted API cannot lose a result.
- Checked live: a task went from queued to completed for 3 credits and its webhook arrived with a valid signature; a burst of 16 requests gave 10 accepted and 6 limited; a second sync search during a running one was refused.
- Not built: batch submission, clearing the queue, and cleaning up a task if queuing fails right after it is saved.

Still open in step 2:

- Pagination (`pages` above 1) and the mobile device option.
- The 20-query bake-off against Camoufox and Patchright. CloakBrowser has not been blocked in headed mode, so this is now a check on block rate at volume, not a blocker.
- Running the browser inside Docker on a virtual display.

## Goal

Build a portfolio-grade clone of cloro.dev: an API that takes a search query, fetches the live Google results page, and returns it as clean structured JSON, with a dashboard to manage keys, try requests and inspect logs.

The first version covers Google Search only. Sponsored ads are not extracted. AI engines (ChatGPT, Perplexity, Gemini and others) come later, on the same request and response shape.

## Roadmap

The project is split into chapters. Each chapter ships something usable. This document details chapter 1; later chapters get their own plan when they start.

| Chapter             | What it adds                                                                                                                             | New work                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1. Google Search    | Organic results, related searches, People Also Ask, knowledge panel, plus the whole platform: API, keys, credits, async, dashboard, docs | Everything in "Build order" below                                                         |
| 2. More Google      | AI Overview, Google News, then ads, shopping and local pack if wanted                                                                    | New parsers on the same fetcher                                                           |
| 3. ChatGPT          | `POST /v1/monitor/chatgpt`: answer text, markdown, sources, search queries                                                               | A new browser flow that types a prompt and waits for the streamed answer, plus its parser |
| 4. Other AI engines | Perplexity, Gemini, Copilot, Google AI Mode, Grok, one at a time                                                                         | One browser flow and one parser per engine                                                |
| 5. Going public     | Proxy provider, country and state targeting, public deployment, per-visitor limits                                                       | One route provider, hosting                                                               |

The platform is built once in chapter 1. From chapter 2 on, adding an engine means one fetch flow, one parser, one endpoint and one entry in the playground's engine list; keys, credits, logs, queue and webhooks are reused unchanged.

## Where it runs

- Everything runs on the developer's own machine for now, started with Docker.
- Google is fetched directly from that machine's connection. No proxies in version 1.
- The fetcher takes its network route as an input, so a proxy provider can be added later without touching the parser or the API.
- Public deployment is a later step, once proxies exist.

## Why this is a good portfolio piece

- It shows a full product, not a script: scraping, parsing, a public API, a queue, a dashboard and docs.
- The hard parts are visible and explainable: block handling, parser stability, concurrency limits, charging only on success.
- It can be demoed live from a public playground.

## Version 1 scope

### Search API

- One endpoint: `POST /v1/monitor/google`.
- Request fields: `query`, `country`, `device` (desktop or mobile), `pages` (1 to 10), `include`.
- Response: `success` plus `result`, with the same envelope every engine will use later.
- Parsed sections, in build order:
  1. Organic results: `position`, `title`, `link`, `snippet`, `page`.
  2. Related searches: `query`.
  3. People Also Ask: `question` now; `snippet` and `link` once the fetcher expands each question.
  4. Knowledge panel: `title`, `subtitle`, `description`, `facts`.
- Optional output through `include`: `html` (raw page), `markdown`.
- Failed fetches are retried automatically before an error is returned.

### Platform

- API keys: create, name, revoke. Bearer auth.
- Credits: each successful request costs credits; failed requests cost nothing. Credits are simulated, with no real payments.
- Limits: a per-account concurrency cap and a per-second rate limit, both returned in response headers.
- One error envelope for every failure: `code`, `message`, `details`, `timestamp`.
- Async mode: submit a task, get a `taskId`, then poll or receive a webhook. Statuses are `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`.

### Dashboard

- Sign up and sign in.
- Overview: credits left, requests today, success rate, average latency.
- Playground: query form on the left; JSON, HTML and Code tabs on the right.
- API keys.
- Webhooks.
- Logs: every request with status, duration, credits charged and a link to the response.

### Public site

- Landing page: what it does, a live example, the response shape.
- Docs: quickstart, authentication, endpoint reference, errors, limits.
- Status of the Google engine.

## Out of scope for chapter 1

- Sponsored ads, shopping results, local pack, AI Overview, Google News.
- City-level targeting (`location`, `uule`) and US state targeting.
- AI engines.
- Proxies and public deployment. The slot for a proxy provider exists; no provider is wired in.
- Real billing, plans, teams and organisations.
- SDKs, MCP server, no-code integrations.
- Blog, comparison pages, leaderboard.

## Build order (chapter 1)

1. **Parser.** Saved Google result pages in, structured JSON out. Pure functions, tested against fixtures.
2. **Fetcher.** Get a live results page for a query, country and device from the local machine; detect blocks and retry. The network route is pluggable so a proxy can be added later.
3. **Sync API.** The endpoint, API key auth, error envelope, credit charging, request log.
4. **Dashboard.** Sign in, keys, playground, logs, overview.
5. **Async.** Task queue, polling endpoint, webhooks, concurrency cap.
6. **Public site and docs.** Landing page and docs, served locally.

Chapters 2 to 5 follow, as listed in the roadmap.

## Technologies

One language, TypeScript, in one monorepo.

| Part               | Choice                                         | Why                                                |
| ------------------ | ---------------------------------------------- | -------------------------------------------------- |
| Monorepo           | pnpm workspaces + Turborepo                    | Shared types and parser across apps                |
| Site and dashboard | Next.js (App Router), Tailwind, shadcn/ui      | Landing, docs and dashboard in one app             |
| API                | Hono + Zod, OpenAPI generated from the schemas | Small, typed, the spec stays in sync with the code |
| Worker             | BullMQ worker process                          | Runs the browser, separate from the API            |
| Database           | Postgres + Drizzle                             | Users, keys, credits, logs, tasks                  |
| Queue and counters | Redis + BullMQ                                 | Task queue, rate limit, concurrency cap            |
| Auth               | Better Auth, email and password                | Self-hosted, works offline                         |
| HTML parsing       | cheerio                                        | Parsers stay pure: HTML string in, JSON out        |
| Tests              | Vitest with saved HTML fixtures                | Catches markup drift                               |
| Local run          | Docker Compose                                 | Postgres, Redis, API, worker, web                  |

Sync and async requests share one path: the API puts a job on the queue; a sync request waits for that job, an async request returns its `taskId`.

### Fetching: stealth browser

Plain Playwright is not enough. In a 2026 benchmark of seven tools, vanilla Playwright, Patchright and rebrowser were all hard-blocked on Google, while CloakBrowser, Camoufox, nodriver and curl_cffi passed.

| Tool         | Fits TypeScript                   | Google in benchmark  | Notes                                                                                                                   |
| ------------ | --------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| CloakBrowser | Yes, npm, Playwright drop-in      | Passed               | Chromium patched at source level. Binary is free but closed and not redistributable; the free build trails the paid one |
| Camoufox     | Partly, Node bindings less mature | Passed               | Patched Firefox. Slower. Upstream changed maintainers and 2026 builds are previews                                      |
| nodriver     | No, Python only                   | Passed, best overall | Would need a Python sidecar service. AGPL-3.0                                                                           |
| Patchright   | Yes, Playwright drop-in           | Blocked              | Easy, but not enough for Google                                                                                         |
| curl_cffi    | No, Python only                   | Passed               | No browser, so no rendered results                                                                                      |

Decision:

- **Primary: CloakBrowser** through its npm package, driven with the Playwright API.
- **Fallback: Camoufox**, tried when CloakBrowser gets blocked.
- **Not now: nodriver.** It breaks the single-language rule. It stays as a possible third provider behind the same interface if both others fail.
- CloakBrowser's closed, non-redistributable binary is accepted. The repo never contains it; the Docker build downloads it.

The fetcher hides the browser behind a `BrowserProvider` interface and the network behind a `RouteProvider` interface, so swapping either is one new file. A provider hands out a Playwright page; each engine's flow (open, type, wait, read) is written once against that page and works with any Playwright-compatible browser.

Techniques the fetcher uses beyond the browser itself:

- Headed mode by default. Headless is detected far more often; inside Docker the browser runs on a virtual display.
- A persistent profile per session, warmed once, with the consent screen already accepted.
- Timezone, locale and language that match the machine's real location.
- Human-like pacing: typed queries, scrolling, random delays, a low request rate per session.
- Block detection on every page (CAPTCHA page, `/sorry/` redirect, empty results), then backoff and a fresh session.
- The worker can also run natively on the host instead of in Docker, for the most realistic browser.

Step 2 starts with a bake-off: the same 20 queries through CloakBrowser, Camoufox and Patchright from this machine, recording the block rate. The winner becomes the default provider.

## Done means

- A query sent from the playground returns parsed organic results from a live Google page.
- The same request works with curl and an API key.
- A failed request is retried, costs no credits and appears in Logs with its error code.
- Exceeding the concurrency cap returns 429.
- An async task finishes and delivers its webhook.
- The parser has fixture tests that fail loudly when Google's markup changes.
- The whole stack starts locally with one Docker command and the README explains the architecture.
- Adding a proxy later means writing one new route provider, with no change to the parser or the API.

## Risks

- **Blocking.** Google blocks automated traffic quickly. With one home connection and no proxies, volume must stay low and requests must be paced, or the connection gets CAPTCHA pages. Country targeting is also limited to what Google's own URL parameters allow from one location. This is the main unknown and should be proven in step 2 before building the rest.
- **Markup drift.** Google changes its page structure often, so parsers break. Fixture tests and one parser per section keep the damage small.
- **Terms of service.** Scraping Google is against its terms. Keep the demo low-volume and rate-limited, and present it as a portfolio project.
- **Cost.** None in version 1. Proxies and hosting add cost once the demo goes public, and the playground will then need a strict per-visitor limit.
- **Scope creep.** cloro has about 40 endpoints. Version 1 is one endpoint done well.

## Open questions

- "Without ads" is read here as: do not extract sponsored results in version 1. Confirm, or say if it meant something else.
- Which sections matter most after organic results?
