import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createCloakBrowserProvider,
  directRoute,
  fetchGoogleSearch,
} from "../src/index.ts";

const [query = "best crm tools for small businesses", country = "US"] =
  process.argv.slice(2);

const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const fixturesDir = resolve(
  import.meta.dirname,
  "../../parser/fixtures/google",
);
const profileDir = resolve(
  import.meta.dirname,
  "../../../.profiles/cloakbrowser",
);

const provider = createCloakBrowserProvider({
  profileDir,
  route: directRoute.nextRoute(),
  headless: process.env.HEADLESS === "true",
  locale: "en-US",
});

try {
  const fetched = await fetchGoogleSearch(
    provider,
    { query, country, language: "en", timeoutMs: 30_000 },
    { attempts: 2, backoffMs: 5_000 },
  );
  await mkdir(fixturesDir, { recursive: true });
  const file = resolve(fixturesDir, `${slug}.html`);
  await writeFile(file, fetched.html);
  console.log(
    JSON.stringify({
      status: fetched.status,
      bytes: fetched.html.length,
      file,
    }),
  );
} finally {
  await provider.close();
}
