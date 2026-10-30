import { toTaskView } from "@scru/core";
import type { ApiApp, ApiConfig, ApiDeps } from "../deps.ts";
import { meterRequest } from "../requests/meterRequest.ts";
import { executeExtract } from "./executeExtract.ts";
import {
  extractRoute,
  listExtractorsRoute,
  prepareExtractorRoute,
} from "./extractorRoutes.ts";
import { startPreparation } from "./startPreparation.ts";
import { submitPreparation } from "./submitPreparation.ts";
import { toExtractorView } from "./toExtractorView.ts";

export const registerExtractorRoutes = (
  app: ApiApp,
  deps: ApiDeps,
  config: ApiConfig,
): void => {
  app.openapi(prepareExtractorRoute, async (c) => {
    const task = await submitPreparation(
      deps,
      config,
      c.get("actor"),
      c.req.valid("json"),
    );
    return c.json({ success: true as const, task: toTaskView(task) }, 202);
  });

  app.openapi(listExtractorsRoute, async (c) => {
    const extractors = await deps.listExtractors(c.get("actor").workspaceId);
    return c.json(
      { success: true as const, extractors: extractors.map(toExtractorView) },
      200,
    );
  });

  app.openapi(extractRoute, async (c) => {
    const request = c.req.valid("json");
    const actor = c.get("actor");
    const extractor = await deps.findLatestExtractor(
      actor.workspaceId,
      new URL(request.url).hostname,
    );
    if (!extractor && config.extractorsEnabled) {
      const task = await startPreparation(deps, config, actor, request.url);
      return c.json(
        {
          success: true as const,
          status: "PREPARING" as const,
          task: toTaskView(task),
        },
        202,
      );
    }
    const body = await meterRequest(c, deps, {
      engine: "extract",
      request,
      execute: (actor) => executeExtract(deps, actor, request),
      loggedBody: (response) => response,
    });
    return c.json(body, 200);
  });
};
