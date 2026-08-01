import { resolve } from "node:path";
import {
  createCloakBrowserProvider,
  directRoute,
  fetchGoogleSearch,
} from "@scru/fetcher";
import { parseGoogleSearchPages } from "@scru/parser";

const [query, country = "US", pages = "1"] = process.argv.slice(2);

if (!query) {
  console.error('Usage: pnpm serp "<query>" [country] [pages]');
  process.exit(1);
}

const provider = createCloakBrowserProvider({
  profileDir: resolve(import.meta.dirname, "../../../.profiles/cloakbrowser"),
  route: directRoute.nextRoute(),
  headless: false,
  locale: "en-US",
});

try {
  const fetched = await fetchGoogleSearch(
    provider,
    {
      query,
      country,
      language: "en",
      pages: Number(pages),
      timeoutMs: 30_000,
    },
    { attempts: 2, backoffMs: 5_000 },
  );
  console.log(
    JSON.stringify(
      {
        success: true,
        result: parseGoogleSearchPages(fetched.map(({ html }) => html)),
      },
      null,
      2,
    ),
  );
} finally {
  await provider.close();
}
