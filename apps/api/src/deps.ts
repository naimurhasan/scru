import type { GoogleSearchJob, SearchOutcome } from "@scru/core";
import type { NewRequestLog, RequestActor } from "@scru/db";

export type ApiDeps = {
  findApiKey: (keyHash: string) => Promise<RequestActor | null>;
  findWorkspaceActor: (workspaceId: string) => Promise<RequestActor | null>;
  chargeCredits: (
    workspaceId: string,
    amount: number,
  ) => Promise<number | null>;
  recordRequest: (log: NewRequestLog) => Promise<void>;
  searchGoogle: (job: GoogleSearchJob) => Promise<SearchOutcome>;
};

export type ApiConfig = {
  internalToken: string;
};

export type ApiEnv = {
  Variables: {
    actor: RequestActor;
  };
};
