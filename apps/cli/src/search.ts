import { resolve } from "node:path";
import {
  createCloakBrowserProvider,
  directRoute,
  fetchGoogleSearch,
} from "@scru/fetcher";
import { parseGoogleSearch } from "@scru/parser";

const [query, country = "US"] = process.argv.slice(2);

if (!query) {
  console.error('Usage: pnpm serp "<query>" [country]');
  process.exit(1);
}

const provider = createCloakBrowserProvider({
  profileDir: resolve(import.meta.dirname, "../../../.profiles/cloakbrowser"),
  route: directRoute.nextRoute(),
  headless: false,
  locale: "en-US",
});

try {
  const page = await fetchGoogleSearch(
    provider,
    { query, country, language: "en", timeoutMs: 30_000 },
    { attempts: 2, backoffMs: 5_000 },
  );
  console.log(
    JSON.stringify(
      { success: true, result: parseGoogleSearch(page.html) },
      null,
      2,
    ),
  );
} finally {
  await provider.close();
}
