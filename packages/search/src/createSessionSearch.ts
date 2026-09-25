import type { GoogleSearchJob, GoogleSession, SearchOutcome } from "@scru/core";
import { detectBlock, type FetchedPage } from "@scru/fetcher/http";
import { parseGoogleSearchPages } from "@scru/parser";
import { resolveResultLinks } from "./resolveResultLinks.ts";

export type SessionSearchDeps = {
  pickSession: () => Promise<GoogleSession | null>;
  recordUse: (sessionId: string) => Promise<void>;
  discardSession: (sessionId: string) => Promise<void>;
  fetchPages: (
    session: GoogleSession,
    job: GoogleSearchJob,
  ) => Promise<FetchedPage[]>;
  resolveRedirect: (
    session: GoogleSession,
    link: string,
  ) => Promise<string | null>;
  fallback: (job: GoogleSearchJob) => Promise<SearchOutcome>;
};

export const createSessionSearch =
  (deps: SessionSearchDeps) =>
  async (job: GoogleSearchJob): Promise<SearchOutcome> => {
    const fallback = () => deps.fallback({ ...job, browserOnly: true });
    if (job.browserOnly) return fallback();

    const session = await deps.pickSession();
    if (!session) return fallback();

    const pages = await deps.fetchPages(session, job).catch(() => null);
    const [first] = pages ?? [];
    if (!pages || !first) return fallback();
    if (detectBlock(first)) {
      await deps.discardSession(session.id);
      return fallback();
    }

    const parsed = parseGoogleSearchPages(pages.map(({ html }) => html));
    const result = job.resolveLinks
      ? await resolveResultLinks(parsed, (link) =>
          deps.resolveRedirect(session, link),
        )
      : parsed;
    await deps.recordUse(session.id);

    return {
      ok: true,
      result,
      html: job.includeHtml ? first.html : null,
      pages: pages.length,
    };
  };
