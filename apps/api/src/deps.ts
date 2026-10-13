import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import type { ActiveApiKey, NewRequestLog } from "@scru/db";

export type ApiDeps = {
  findApiKey: (keyHash: string) => Promise<ActiveApiKey | null>;
  chargeCredits: (
    workspaceId: string,
    amount: number,
  ) => Promise<number | null>;
  recordRequest: (log: NewRequestLog) => Promise<void>;
  searchGoogle: (job: GoogleSearchJob) => Promise<SearchOutcome>;
};

export type ApiEnv = {
  Variables: {
    apiKey: ActiveApiKey;
  };
};
