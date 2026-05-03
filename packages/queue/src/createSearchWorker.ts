import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import { Worker } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { SEARCH_QUEUE } from "./searchQueue.ts";

export type SearchProcessor = (job: {
  data: GoogleSearchJob;
}) => Promise<SearchOutcome>;

export const createSearchWorker = (
  redisUrl: string,
  processor: SearchProcessor,
) => {
  const connection = createRedisConnection(redisUrl);
  const worker = new Worker<GoogleSearchJob, SearchOutcome>(
    SEARCH_QUEUE,
    processor,
    { connection, concurrency: 1 },
  );

  return {
    worker,
    close: async () => {
      await worker.close();
      connection.disconnect();
    },
  };
};
