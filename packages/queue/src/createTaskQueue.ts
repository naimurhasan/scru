import { Queue } from "bullmq";
import { createRedisConnection } from "./createRedisConnection.ts";
import { JOB_RETENTION } from "./jobRetention.ts";
import { toQueuePriority } from "./toQueuePriority.ts";

export const createTaskQueue = <Job>(redisUrl: string, queueName: string) => {
  const connection = createRedisConnection(redisUrl);
  const queue = new Queue(queueName, { connection });

  return {
    enqueue: async (job: Job, taskPriority: number): Promise<void> => {
      await queue.add(queueName, job, {
        ...JOB_RETENTION,
        priority: toQueuePriority(taskPriority),
      });
    },
    close: async () => {
      await queue.close();
      connection.disconnect();
    },
  };
};
