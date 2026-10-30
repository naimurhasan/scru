import type { RequestActor, Task } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { pickPendingPreparation } from "./pickPendingPreparation.ts";
import { prepareExtractorRequestSchema } from "./schemas.ts";
import { submitPreparation } from "./submitPreparation.ts";

export const startPreparation = async (
  deps: Pick<ApiDeps, "createTask" | "enqueueExtractor" | "listPreparations">,
  config: ApiConfig,
  actor: RequestActor,
  url: string,
): Promise<Task> =>
  pickPendingPreparation(
    await deps.listPreparations(actor.workspaceId),
    new URL(url).hostname,
  ) ??
  submitPreparation(
    deps,
    config,
    actor,
    prepareExtractorRequestSchema.parse({ url }),
  );
