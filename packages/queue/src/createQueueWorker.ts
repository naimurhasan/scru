import { Worker } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";

export type QueueProcessor<Job, Outcome> = (job: {
  data: Job;
}) => Promise<Outcome>;

export const createQueueWorker = <Job, Outcome>(
  redisUrl: string,
  queueName: string,
  processor: QueueProcessor<Job, Outcome>,
  concurrency: number,
) => {
  const connection = createRedisConnection(redisUrl);
  const worker = new Worker<Job, Outcome>(queueName, processor, {
    connection,
    concurrency,
  });

  return {
    worker,
    close: async () => {
      await worker.close();
      connection.disconnect();
    },
  };
};
