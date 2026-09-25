import type { GoogleSession } from "@scru/core";

export type SessionKeeperDeps = {
  target: number;
  intervalMs: number;
  size: () => Promise<number>;
  harvest: () => Promise<GoogleSession | null>;
  add: (session: GoogleSession) => Promise<void>;
  onError: (error: unknown) => void;
};

export const topUpSessions = async ({
  target,
  size,
  harvest,
  add,
}: Pick<
  SessionKeeperDeps,
  "target" | "size" | "harvest" | "add"
>): Promise<number> => {
  const missing = Math.max(target - (await size()), 0);
  let added = 0;
  for (let attempt = 0; attempt < missing; attempt += 1) {
    const session = await harvest();
    if (!session) break;
    await add(session);
    added += 1;
  }
  return added;
};

export const keepSessionsReady = (deps: SessionKeeperDeps) => {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await topUpSessions(deps);
    } catch (error) {
      deps.onError(error);
    } finally {
      running = false;
    }
  };
  void tick();
  const timer = setInterval(tick, deps.intervalMs);
  return { stop: () => clearInterval(timer) };
};
