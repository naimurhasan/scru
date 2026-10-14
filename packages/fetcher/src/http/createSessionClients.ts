import type { GoogleSession } from "@scru/core";
import {
  createSessionClient,
  type SessionClient,
} from "./createSessionClient.ts";

export const createSessionClients = () => {
  const clients = new Map<string, SessionClient>();

  return {
    clientFor: (session: GoogleSession): SessionClient => {
      const existing = clients.get(session.id);
      if (existing) return existing;
      const created = createSessionClient(session);
      clients.set(session.id, created);
      return created;
    },
    forget: (sessionId: string): void => {
      clients.delete(sessionId);
    },
  };
};
