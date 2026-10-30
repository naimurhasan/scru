"use client";

import { useEffect, useRef } from "react";
import { readTask } from "@/app/dashboard/search/actions";
import { readTaskState, type TaskState } from "@/lib/playground/readTaskState";

const POLL_EVERY_MS = 3_000;
const SETTLED = new Set(["COMPLETED", "FAILED"]);

export const useTaskWatch = (
  taskId: string | null,
  onSettled: (state: TaskState) => void,
) => {
  const settle = useRef(onSettled);
  settle.current = onSettled;

  useEffect(() => {
    if (taskId === null) return;
    let stopped = false;
    const timer = setInterval(async () => {
      const state = readTaskState((await readTask(taskId)).body);
      if (stopped || state === null || !SETTLED.has(state.status)) return;
      stopped = true;
      clearInterval(timer);
      settle.current(state);
    }, POLL_EVERY_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [taskId]);
};
