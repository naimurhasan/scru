import { createCloakBrowserProvider, directRoute } from "@scru/fetcher";
import { createSearchWorker, SEARCH_QUEUE } from "@scru/queue";
import { createSearchProcessor } from "./createSearchProcessor.ts";
import { loadEnv } from "./env.ts";

const env = loadEnv();

const provider = createCloakBrowserProvider({
  profileDir: env.profileDir,
  route: directRoute.nextRoute(),
  headless: env.headless,
  locale: "en-US",
});

const { worker, close } = createSearchWorker(
  env.redisUrl,
  createSearchProcessor(provider),
);

worker.on("ready", () => console.log(`Worker listening on ${SEARCH_QUEUE}`));
worker.on("completed", (job, outcome) =>
  console.log(
    `Job ${job.id} ${outcome.ok ? "succeeded" : `failed: ${outcome.reason}`}`,
  ),
);
worker.on("failed", (job, error) =>
  console.error(`Job ${job?.id} crashed: ${error.message}`),
);

const shutdown = async () => {
  await close();
  await provider.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
