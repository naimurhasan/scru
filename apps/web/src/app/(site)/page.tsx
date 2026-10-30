import { Clock, Coins, Globe, Layers, ListTree, Webhook } from "lucide-react";
import Link from "next/link";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { FeatureCard } from "@/components/site/FeatureCard";
import { ProductShowcase } from "@/components/site/showcase/ProductShowcase";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EXAMPLE_RESPONSE } from "@/lib/docs/examples";
import { env } from "@/lib/env";
import { prettyJson } from "@/lib/format/prettyJson";
import { buildCurlSnippet } from "@/lib/playground/buildCurlSnippet";

const ENGINES = [
  { name: "Google Search", available: true },
  { name: "Google AI Overview", available: false },
  { name: "Google News", available: false },
  { name: "ChatGPT", available: false },
  { name: "Perplexity", available: false },
  { name: "Gemini", available: false },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Badge variant="outline">Fetch, Extract and Crawl are live</Badge>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn any website into clean data
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Fetch a page in the format you need, get any site as JSON without
          writing selectors, crawl it whole or send a thousand addresses as one
          job.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Get 500 free credits
          </Link>
          <Link
            href="/docs"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Read the docs
          </Link>
        </div>
        <div className="mt-14">
          <ProductShowcase />
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_minmax(0,1.1fr)] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Search results as clean JSON
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Send a query and get organic results, People also ask, related
              searches and the knowledge panel back as structured data.
            </p>
          </div>
          <div className="grid min-w-0 gap-3">
            <CodeBlock
              label="Request"
              code={buildCurlSnippet(env.API_URL, "/v1/monitor/google", {
                query: "best crm tools for small businesses",
                country: "US",
                pages: 1,
              })}
            />
            <CodeBlock
              code={prettyJson(EXAMPLE_RESPONSE)}
              label="Response"
              language="json"
              className="max-h-80"
            />
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything you need to track search
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<Globe />} title="Live results by country">
              Every request runs a fresh search. Pick the country with a
              two-letter code.
            </FeatureCard>
            <FeatureCard icon={<ListTree />} title="Structured fields">
              Titles, real links, snippets, questions, related searches and
              knowledge panel facts, already parsed.
            </FeatureCard>
            <FeatureCard icon={<Layers />} title="Up to 10 pages">
              Ask for more pages in one request. Positions continue across
              pages.
            </FeatureCard>
            <FeatureCard icon={<Clock />} title="Async tasks">
              Queue a search, get a task id back at once, and poll for the
              result when it suits you.
            </FeatureCard>
            <FeatureCard icon={<Webhook />} title="Signed webhooks">
              Have finished tasks sent to your server, signed so you can check
              they came from us.
            </FeatureCard>
            <FeatureCard icon={<Coins />} title="Pay for success only">
              Failed or timed-out requests cost nothing. Credits are charged
              only when results come back.
            </FeatureCard>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Engines</h2>
          <p className="mt-2 text-muted-foreground">
            One request shape for every engine as they are added.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ENGINES.map(({ name, available }) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <span className="font-medium">{name}</span>
                <Badge variant={available ? "secondary" : "outline"}>
                  {available ? "Live" : "Coming soon"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Try it in the playground
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create an account, try any page from the dashboard, then copy the
              same request as curl.
            </p>
          </div>
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
