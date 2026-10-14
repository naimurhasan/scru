import type { GoogleSearchJob, GoogleSession, SearchOutcome } from "@scru/core";
import { createSessionClients, fetchSearchPages } from "@scru/fetcher/http";
import { createSessionSearch } from "./createSessionSearch.ts";

export type SessionStore = {
  pick: () => Promise<GoogleSession | null>;
  recordUse: (sessionId: string) => Promise<void>;
  discard: (sessionId: string) => Promise<void>;
};

export const connectSessionSearch = (
  store: SessionStore,
  fallback: (job: GoogleSearchJob) => Promise<SearchOutcome>,
) => {
  const clients = createSessionClients();

  return createSessionSearch({
    pickSession: store.pick,
    recordUse: store.recordUse,
    discardSession: async (sessionId) => {
      clients.forget(sessionId);
      await store.discard(sessionId);
    },
    fetchPages: (session, job) =>
      fetchSearchPages(clients.clientFor(session), job),
    resolveRedirect: (session, link) =>
      clients.clientFor(session).resolveRedirect(link),
    fallback,
  });
};
