import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createCloakBrowserProvider,
  ANY_ROUTE,
  directRoute,
  fetchGoogleSearch,
} from "../src/index.ts";

const [
  query = "best crm tools for small businesses",
  country = "US",
  pages = "1",
] = process.argv.slice(2);

const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const fixturesDir = resolve(
  import.meta.dirname,
  "../../parser/fixtures/google",
);
const profileDir = resolve(
  import.meta.dirname,
  "../../../.profiles/cloakbrowser",
);

const fixtureFile = (pageNumber: number) =>
  resolve(
    fixturesDir,
    pageNumber === 1 ? `${slug}.html` : `${slug}.page-${pageNumber}.html`,
  );

const provider = createCloakBrowserProvider({
  profileDir,
  route: directRoute.routeFor(ANY_ROUTE),
  headless: process.env.HEADLESS === "true",
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
  await mkdir(fixturesDir, { recursive: true });
  for (const [index, page] of fetched.entries()) {
    const file = fixtureFile(index + 1);
    await writeFile(file, page.html);
    console.log(
      JSON.stringify({ status: page.status, bytes: page.html.length, file }),
    );
  }
} finally {
  await provider.close();
}
