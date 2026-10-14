import type { GoogleSession } from "@scru/core";
import { createRedisConnection } from "./createRedisConnection.ts";

export type SessionPoolOptions = {
  maxUses: number;
  maxAgeSeconds: number;
};

export type SessionPool = {
  add: (session: GoogleSession) => Promise<void>;
  pick: () => Promise<GoogleSession | null>;
  recordUse: (sessionId: string) => Promise<void>;
  discard: (sessionId: string) => Promise<void>;
  size: () => Promise<number>;
};

const MINUTES = 60;

export const DEFAULT_SESSION_POOL_OPTIONS: SessionPoolOptions = {
  maxUses: 200,
  maxAgeSeconds: 360 * MINUTES,
};

const MEMBERS = "scru:sessions";
const sessionKey = (id: string) => `scru:session:${id}`;
const usesKey = (id: string) => `scru:session:${id}:uses`;

const parseSession = (stored: string | null): GoogleSession | null =>
  stored === null ? null : (JSON.parse(stored) as GoogleSession);

export const createSessionPool = (
  redisUrl: string,
  { maxUses, maxAgeSeconds }: SessionPoolOptions = DEFAULT_SESSION_POOL_OPTIONS,
) => {
  const redis = createRedisConnection(redisUrl);

  const discard = async (sessionId: string) => {
    await redis
      .multi()
      .srem(MEMBERS, sessionId)
      .del(sessionKey(sessionId), usesKey(sessionId))
      .exec();
  };

  const pool: SessionPool = {
    add: async (session) => {
      await redis
        .multi()
        .set(
          sessionKey(session.id),
          JSON.stringify(session),
          "EX",
          maxAgeSeconds,
        )
        .set(usesKey(session.id), 0, "EX", maxAgeSeconds)
        .sadd(MEMBERS, session.id)
        .exec();
    },
    pick: async () => {
      const ids = await redis.smembers(MEMBERS);
      for (const id of ids.sort(() => Math.random() - 0.5)) {
        const session = parseSession(await redis.get(sessionKey(id)));
        if (session) return session;
        await discard(id);
      }
      return null;
    },
    recordUse: async (sessionId) => {
      const uses = await redis.incr(usesKey(sessionId));
      if (uses >= maxUses) await discard(sessionId);
    },
    discard,
    size: async () => {
      const ids = await redis.smembers(MEMBERS);
      const alive = await Promise.all(
        ids.map((id) => redis.exists(sessionKey(id))),
      );
      return alive.filter(Boolean).length;
    },
  };

  return { pool, close: () => redis.disconnect() };
};
