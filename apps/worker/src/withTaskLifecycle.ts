import { toTaskSettlement, type TaskSettlement } from "@scru/core";
import type { SearchProcessor } from "@scru/queue";

export type TaskHooks = {
  markProcessing: (taskId: string) => Promise<void>;
  settle: (
    taskId: string,
    settlement: TaskSettlement,
  ) => Promise<{ deliveryId: string | null } | null>;
  enqueueDelivery: (deliveryId: string) => Promise<void>;
};

const INTERNAL_ERROR = 500;

const CRASHED: TaskSettlement = {
  ok: false,
  errorCode: "INTERNAL_ERROR",
  errorMessage: "The task could not be processed",
  httpStatus: INTERNAL_ERROR,
};

export const withTaskLifecycle = (
  search: SearchProcessor,
  hooks: TaskHooks,
): SearchProcessor => {
  const settle = async (taskId: string, settlement: TaskSettlement) => {
    const settled = await hooks.settle(taskId, settlement);
    if (settled?.deliveryId) await hooks.enqueueDelivery(settled.deliveryId);
  };

  return async (job) => {
    const { taskId } = job.data;
    if (taskId === null) return search(job);
    await hooks.markProcessing(taskId);
    try {
      const outcome = await search(job);
      await settle(taskId, toTaskSettlement(outcome));
      return outcome;
    } catch (error) {
      await settle(taskId, CRASHED);
      throw error;
    }
  };
};
