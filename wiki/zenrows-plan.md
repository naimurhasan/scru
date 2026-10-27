# scru — ZenRows plan

Status: planned on 25 Oct 2026. Replaces chapters 2 to 5 of [plan.md](plan.md). Chapter 1 (Google Search and the platform) stays as built.

## Progress

| Step       | State       | Notes                                                                                                                                                     |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Fetch   | In progress | `POST` and `GET /v1/fetch` with rendering, page instructions, outputs, CSS extraction, Webshare proxies with country and sessions, and the reCAPTCHA step |
| 2. Crawl   | Done        | `POST /v1/crawl` as a `CRAWL` task, pages through `GET /v1/crawl/{taskId}/pages`, robots.txt, include and exclude patterns                                |
| 3. Extract | In progress | `POST /v1/extractors` prepares a versioned extractor per site, `POST /v1/extract` runs it without a model; dashboard, self-repair not yet                 |

What the first Fetch slice settled (25 Oct 2026):

- **Flow:** the API fetches over plain HTTP with `impit`; a challenged page or a network error goes to the new `page-render` queue, where the worker renders it with CloakBrowser and waits up to 15 seconds for a challenge to clear.
- **Block detection:** status 403, 429 or 503, named as `cloudflare`, `datadome`, `captcha` or `blocked_status` from markers in the page; the Cloudflare "Just a moment" page counts at any status. A 404 or a CAPTCHA inside an ordinary form is not a block.
- **Cost:** 1 credit plain, 5 with `jsRender`. A page escalated to the browser on its own is still charged as plain.
- **Safety:** target URLs must be public `http` or `https` addresses, using the same check as webhooks, now named `isPublicUrl`.
- **Logs:** engine `fetch`; the page content is not stored, extracted `data` is.
- Checked live: books.toscrape.com over HTTP in about 1.1 s with 20 titles and prices extracted; G2 answered 403 `datadome` and Zillow 403 `captcha`; quotes.toscrape.com/js rendered with `waitFor` and a full-page screenshot in 3.4 s, and a missing selector answered `selector_not_found`.

What proxies and CAPTCHAs settled (27 Oct 2026):

- **Webshare instead of PacketStream for now.** The username picks the route: `user-rotate` for a fresh proxy per request, `user-GB-rotate` for a country, `user-3` to hold proxy 3. The free plan has 10 proxies; `WEBSHARE_POOL_SIZE` says how many.
- **Request fields:** `premiumProxy`, then `country` or `sessionId`, which both need `premiumProxy` and cannot be combined. A session maps to the same proxy every time by hashing its id. Without proxy credentials the API refuses `premiumProxy`.
- **Cost:** 10 credits with `premiumProxy`, 25 with `premiumProxy` and `jsRender`.
- **Plain HTTP through a proxy** gives each proxy 10 seconds and tries up to 3 proxies, because a free proxy now and then stalls for 20 seconds or more.
- **A proxied render gets its own browser** held on one proxy, with the browser's timezone set to the exit's, looked up through the proxy. A rotating proxy would change the address on every connection, and a Dhaka timezone behind a Los Angeles address is easy to spot.
- **CAPTCHA step:** when a rendered page is still challenged and has a reCAPTCHA, the worker clicks the checkbox first, which is free. Only if Google shows a picture puzzle does it pay 2captcha (about $0.003, 5 to 45 seconds), then hands the token to the page's callback or submits its form. Without `TWOCAPTCHA_API_KEY` it only clicks.
- Checked live: rotating, country and session routes gave the expected exits; a proxied render loaded in 7.4 s with the browser on the exit's timezone; on 2captcha's demo page the click got a puzzle, 2captcha solved it in 46 s and the site's check answered `success: true`.

What page instructions and the `GET` form settled (27 Oct 2026):

- **`jsInstructions`:** up to 20 steps, each one of `click`, `fill`, `select`, `press`, `wait`, `waitFor` or `scrollY`, run after the page loads and before `waitFor`. Needs `jsRender`. Arbitrary JavaScript is not accepted.
- **A failed step does not fail the request.** Each step gets 10 seconds; the result carries an `instructions` report with `ok`, `durationMs` and `error` per step, so the caller sees exactly where a flow broke.
- **`GET /v1/fetch`** takes the same fields as query parameters: booleans as `true` or `false`, `wait` as a number, `cssExtractor` and `jsInstructions` as JSON. It is validated by the same schema as `POST`, so both answer the same errors.
- Checked live: on quotes.toscrape.com/login, filling both fields, clicking submit and waiting for the logout link signed in within 22 s; a click on a missing element was reported as failed after 10 s and the page was still returned. Typing is slow, about 2.5 s per field, because the browser types like a person.
- **PDF is dropped for now.** Chromium only prints PDFs headless, and the browser runs headed.

What the playground and docs settled (27 Oct 2026):

- **Playground:** an engine switch between Google Search and Fetch any page. The Fetch form has URL, output, JavaScript rendering with an optional element to wait for, and a premium proxy with an optional country. The Preview tab shows a screenshot as an image, HTML in a sandboxed frame with scripts off, Markdown and text as text, and extracted data as JSON. The Code tab builds the matching curl.
- **Browser code must not import values from `@scru/core`:** its entry point also exports the Node-only crypto helpers. The web app keeps its own list of outputs in `lib/playground/fetchOutputs.ts` and imports only types from core.
- **Docs:** the API reference has Fetch (fields, `GET` form, result, prices) and Page instructions sections; `FETCH_FAILED` and `TIMEOUT` are described for both engines.
- The web app builds for production. The playground has not been clicked through yet, because Docker was not running.
- Not built yet: Turnstile and hCaptcha.

What Crawl settled (27 Oct 2026):

- **A crawl is a task** of type `CRAWL`, so queueing, `GET /v1/async/task/{id}`, idempotency, signed webhooks and the request log are shared with Google tasks. The steps both submissions share live in `apps/api/src/tasks/queueTask.ts`.
- **The loop is `@scru/crawler`'s `runCrawl`:** breadth first, same host only, asset links skipped, robots.txt rules for `*` checked when a link is queued, a 500 ms pause between pages, stopping at `maxDepth` or `limit`. Each page goes through the same Fetch pipeline, so rendering, proxies and the CAPTCHA step all apply.
- **Pages are stored in `crawl_pages`** with their visit `position`, read in batches of up to 50 with `after` as the cursor, and readable while the crawl runs.
- **Cost:** each fetched page is priced like a Fetch with the same options and the total is charged when the crawl finishes. Submitting needs credits for `limit` pages. A crawl that fetched nothing fails and costs nothing.
- **`include` and `exclude` decide which links are followed at all,** not only which are returned, so a pattern that misses the listing pages also stops the crawl from reaching what they link to.
- Checked live through the API: books.toscrape.com with depth 1, limit 8 and category patterns fetched 8 pages in 8.6 s for 8 credits, queued 45 more, and paged correctly in two batches.
- Known gap: `/` and `/index.html` are fetched as two pages; there is no same-content check yet.

What Extract settled (27 Oct 2026):

- **Preparing is an `EXTRACTOR` task.** The worker fetches the start page, groups its same-site links by URL shape (a path segment with a digit, or a last segment that varies among siblings, becomes `*`), and fetches up to 5 pages from each of the 3 largest groups: 16 pages at most. A plain breadth-first crawl was rejected because on books.toscrape.com the first 20 links are all categories, so the model would never see a product.
- **One model call per page type**, shown 2 simplified sample pages (scripts, styles, comments and most attributes stripped, 15,000 characters each). It answers a page type name, an item selector for list pages or null, and 3 to 12 fields with a selector and an optional attribute. The OpenRouter call asks for JSON and turns reasoning off.
- **Checked before saving:** the selectors run on up to 3 pages the model did not see. Below 80 % average fill, the empty fields and one unseen page go back for a single repair, kept only if it scores better. Fields that never fill are dropped, and so is any field whose values repeat an earlier field on every page, which caught `review_count` copying `availability`. So at most 2 model calls per page type and 6 per preparation.
- **Saved as a new version** in `extractors` per workspace and host, with the fetch options; `POST /v1/extract` uses the newest version, picks the page type whose pattern matches segment by segment, fetches the page and applies the selectors. `href` and `src` values come back as full addresses.
- **Cost:** preparing charges the sample pages at Fetch prices plus 20 credits and needs credits for 16 pages plus 20 to start; extracting costs a Fetch. Failures are free. Needs `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`; without them the worker skips the queue and the API refuses.
- Checked live with `qwen/qwen3.7-flash` on books.toscrape.com: 11 sample pages and 2 model calls in about 20 s found `product_list` and `product_detail`, every kept field at 100 % fill; extracting an unseen book took 1.1 s and an unseen category returned all 19 books in 0.3 s. Two preparations used 4 model calls. The field list differs between runs, as model answers do.
- Not built yet: a dashboard page to see and edit an extractor's fields, an Extract engine in the playground, re-preparing automatically when live fill drops, and `extract: "auto"` on Fetch.

## Goal

Turn scru into a portfolio-grade clone of zenrows.com: a general web scraping API built on five primitives, Fetch, Crawl, Extract, Batch and Browser, with the Google search endpoint kept as the first dedicated scraper.

The headline feature goes past ZenRows: paste any site, and after a few minutes of preparation scru returns a JSON schema and an extractor for that site, written once by an LLM and then run without one.

## What ZenRows offers, and where scru stands

| Primitive | ZenRows                                                                               | scru today                                | To build                                                    |
| --------- | ------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Fetch     | Any URL as HTML, Markdown, text or PDF; anti-bot, JavaScript rendering, geo, sessions | Google only, harvested sessions over HTTP | Generic endpoint, output formats, proxies, CAPTCHA fallback |
| Crawl     | Follows links to a depth, returns every URL and its HTML                              | Nothing                                   | Crawler on the existing queue                               |
| Extract   | `extract=auto`, structured JSON with no selectors, adapts when sites change           | Google parser only                        | Auto Extractor: LLM writes the schema and selectors once    |
| Batch     | Thousands of URLs as one job, parallel workers, signed webhook                        | Single async tasks and signed webhooks    | Batch job that groups tasks                                 |
| Browser   | Persistent remote browser for logins and multi-step flows                             | Nothing                                   | Remote browser session, optional                            |

Access methods ZenRows also ships: REST, CLI, MCP server, SDKs, n8n, Zapier and Make. scru has REST and a CLI; the MCP server is added here.

## Decisions

- **Browser stays CloakBrowser.** Chromhydra was considered and dropped for this project: it is Python on SeleniumBase, its CAPTCHA helper only clicks checkboxes, and CloakBrowser already passes Google.
- **Plain HTTP first, browser on demand.** Every fetch starts with `impit` impersonating Chrome. The browser runs only when `js_render` is asked for or the HTTP response is blocked. This is the same idea as the Google fast path, made general.
- **Proxies: Webshare first.** Rotating, with country targeting and sticky proxies, behind the `RouteProvider` interface. PacketStream's residential proxies can replace it later as one more route provider.
- **CAPTCHAs: click first, 2captcha as a fallback.** The free checkbox click is tried first; 2captcha is paid only when Google shows a picture puzzle.
- **LLM: OpenRouter.** Used only while preparing an extractor, never on a normal request.
- **One language stays.** Everything new is TypeScript in the same monorepo.

## Build order

### 1. Fetch

`GET /v1/fetch?url=…` and the same fields as a `POST` body.

| Field             | Meaning                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `url`             | Page to fetch, required                                             |
| `js_render`       | Render with the browser                                             |
| `wait_for`        | CSS selector to wait for, needs `js_render`                         |
| `wait`            | Milliseconds to wait after load, needs `js_render`                  |
| `js_instructions` | Clicks, typing, scrolls and waits before reading, needs `js_render` |
| `premium_proxy`   | Use a residential route                                             |
| `country`         | Two-letter country, needs `premium_proxy`                           |
| `session_id`      | Keep the same route for 10 minutes                                  |
| `output`          | `html` (default), `markdown`, `text`, `screenshot`, `pdf`           |
| `css_extractor`   | `{ "name": "selector" }`, returns JSON instead of the page          |
| `block_resources` | Skip images, fonts and media, on by default with a proxy            |

- **Cost:** 1 credit for a plain fetch, 5 with `js_render`, 10 with `premium_proxy`, 25 with both. Failed fetches cost nothing, as now.
- **Block detection:** status 403, 429 and 503, Cloudflare and DataDome challenge markers, CAPTCHA iframes, empty bodies. One pure function with fixture tests, like the Google one.
- **Escalation:** HTTP, then browser, then browser on a fresh proxy route, then 2captcha. Each step is logged so the request log shows how a page was won.
- **Playground:** an engine switch between Google and Fetch.

### 2. Crawl

`POST /v1/crawl` with `url`, `depth`, `limit`, `include` and `exclude` URL patterns, and the Fetch options. Always async; results are paged by `GET /v1/crawl/{id}`.

- Same domain only, `robots.txt` respected, a per-domain delay.
- Each page is one Fetch charge.
- Extract uses it to find sample pages.

### 3. Extract

Two ways in:

- `extract=auto` on Fetch, for a domain that already has an extractor.
- `POST /v1/extractors` with a start URL, which prepares a new one. Status: `PREPARING`, `READY`, `FAILED`.

Preparing an extractor:

1. **Crawl** a small sample from the start URL.
2. **Group** URLs by pattern (`/product/:slug`, `/category?page=N`) to tell listing pages from detail pages. Pure function.
3. **Infer** with an LLM through OpenRouter: cleaned Markdown and trimmed HTML of 3 to 5 pages per group in, a JSON Schema and one selector per field out.
4. **Validate** the selectors on pages the LLM did not see. Score the fill rate per field and send the misses back once or twice to be fixed.
5. **Save** a versioned extractor per URL pattern. The dashboard shows the schema, lets the user rename or drop fields, and previews the output.

Running an extractor uses selectors only. When the fill rate on live requests drops below a threshold, the extractor is prepared again and saved as a new version.

### 4. Batch

`POST /v1/batch` with up to 1,000 URLs and shared Fetch or Extract options. One job, per-URL results, progress by `GET /v1/batch/{id}`, and one signed webhook when it finishes. Builds on the async task queue.

### 5. MCP server

A new `apps/mcp` exposing Fetch, Crawl, Extract and Batch as tools, over stdio and HTTP, authenticated with an API key.

### 6. Rebrand

Landing page, pricing and docs rewritten around the five primitives, with Google search listed as a dedicated scraper. Visible copy describes what the product does, never the browsers, machines or workers behind it.

### 7. Browser, optional

A remote browser session that Playwright or Puppeteer can connect to, routed through the same proxies.

## Keys needed in `.env`

| Variable             | Where it comes from                               | Needed from |
| -------------------- | ------------------------------------------------- | ----------- |
| `WEBSHARE_USERNAME`  | Webshare dashboard, proxy username                | Fetch       |
| `WEBSHARE_PASSWORD`  | Webshare dashboard, proxy password                | Fetch       |
| `WEBSHARE_POOL_SIZE` | Number of proxies on the plan, 10 on the free one | Fetch       |
| `TWOCAPTCHA_API_KEY` | 2captcha dashboard, API key                       | Fetch       |
| `OPENROUTER_API_KEY` | OpenRouter                                        | Extract     |
| `OPENROUTER_MODEL`   | Model id to use for inference                     | Extract     |

## Risks

- **Generic anti-bot is much harder than Google.** Cloudflare, DataDome and Akamai vary per site. The demo should name the sites it is tested on rather than claim all of them.
- **Proxy and solver costs.** Proxies bill by plan or traffic and 2captcha by solve, so resources are blocked by default on proxied fetches and the solver is the last step.
- **LLM output drifts.** Selectors are validated on unseen pages before saving, and the schema is stored with the extractor, so a bad run never reaches users.
- **Terms of service.** Keep volumes low, respect `robots.txt` in Crawl, and present it as a portfolio project.

## Open questions

- Tor circuits: Google and most protected sites block Tor exits, so it is not planned as a route. Confirm it can be dropped.
- Camoufox as a second browser: kept as a fallback idea only, not built unless CloakBrowser starts getting blocked.
