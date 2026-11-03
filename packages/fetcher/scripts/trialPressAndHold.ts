import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ANY_ROUTE,
  createCloakBrowserProvider,
  directRoute,
  passPressAndHold,
} from "../src/index.ts";
import { detectChallenge } from "../src/page/detectChallenge.ts";

const [
  url = "https://www.walmart.com/search?q=wireless+mouse",
] = process.argv.slice(2);

const outDir = resolve(import.meta.dirname, "../../../.RESOURCE");
const profileDir = resolve(
  import.meta.dirname,
  process.env.TRIAL_PROFILE
    ? `../../../.profiles/${process.env.TRIAL_PROFILE}`
    : "../../../.profiles/cloakbrowser-trial",
);

const provider = createCloakBrowserProvider({
  profileDir,
  route: directRoute.routeFor(ANY_ROUTE),
  headless: process.env.HEADLESS === "true",
  locale: "en-US",
});

const tab = await provider.openPage();
let status = 0;
tab.on("response", (response) => {
  if (
    response.request().isNavigationRequest() &&
    response.frame() === tab.mainFrame()
  )
    status = response.status();
});

try {
  await tab.goto(url, { waitUntil: "load", timeout: 45_000 });
  console.log(JSON.stringify({ event: "loaded", status, url: tab.url() }));

  let reason: string | null;
  reason = detectChallenge({ status, html: await tab.content() });
  console.log(JSON.stringify({ event: "challenge", reason }));

  if (reason) {
    await tab.waitForTimeout(1_500);
    const result = await passPressAndHold(tab);
    console.log(JSON.stringify({ event: "press_and_hold", result }));
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (tab.isClosed()) break;
      if (detectChallenge({ status, html: await tab.content() }) === null) break;
      await tab.waitForTimeout(1_000);
    }
    reason = tab.isClosed()
      ? "tab_closed"
      : detectChallenge({ status, html: await tab.content() });
    console.log(JSON.stringify({ event: "after_hold", reason, status }));
  }

  const html = await tab.content();
  const products = await tab.locator('a[href*="/ip/"]').count();
  console.log(
    JSON.stringify({
      event: "result",
      ok: reason === null,
      status,
      url: tab.url(),
      products,
      bytes: html.length,
    }),
  );
  await writeFile(resolve(outDir, "walmart-trial.html"), html);
  await tab.screenshot({ path: resolve(outDir, "walmart-trial.png") });
  console.log(JSON.stringify({ event: "evidence", outDir }));
} catch (error) {
  console.log(
    JSON.stringify({
      event: "error",
      message: error instanceof Error ? error.message.split("\n")[0] : "failed",
      tabClosed: tab.isClosed(),
    }),
  );
} finally {
  await tab.close();
  await provider.close();
}
