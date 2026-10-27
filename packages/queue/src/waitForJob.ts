import type { Job, QueueEvents } from "bullmq";

const isWaitTimeout = (error: unknown) =>
  error instanceof Error && error.message.includes("timed out");

export const waitForJob = async <Outcome>(
  job: Job<unknown, Outcome>,
  events: QueueEvents,
  timeoutMs: number,
  timedOut: Outcome,
): Promise<Outcome> => {
  try {
    return await job.waitUntilFinished(events, timeoutMs);
  } catch (error) {
    if (!isWaitTimeout(error)) throw error;
    await job.remove().catch(() => undefined);
    return timedOut;
  }
};
