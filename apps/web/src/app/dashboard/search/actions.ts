"use server";

import { z } from "zod";
import { callApi } from "@/lib/playground/callApi";
import { FETCH_OUTPUT_VALUES } from "@/lib/playground/fetchOutputs";
import { toFetchBody } from "@/lib/playground/toFetchBody";
import type {
  ExtractRequest,
  FetchRequest,
  GoogleSearchRequest,
  PlaygroundResponse,
} from "@/lib/playground/types";
import { requireWorkspace } from "@/lib/requireWorkspace";

const MAX_PAGES = 10;

const googleSearchSchema = z.object({
  query: z.string().trim().min(1).max(500),
  country: z.string().regex(/^[A-Z]{2}$/),
  pages: z.number().int().min(1).max(MAX_PAGES),
});

const fetchSchema = z.object({
  url: z.string().trim().min(1).max(2_000),
  output: z.enum(FETCH_OUTPUT_VALUES),
  jsRender: z.boolean(),
  waitFor: z.string().max(500),
  premiumProxy: z.boolean(),
  country: z.string().regex(/^([A-Z]{2})?$/),
});

const extractSchema = z.object({
  url: z.string().trim().min(1).max(2_000),
});

export const sendGoogleSearch = async (
  input: GoogleSearchRequest,
): Promise<PlaygroundResponse> => {
  const { workspace } = await requireWorkspace();
  return callApi(
    workspace.id,
    "/v1/monitor/google",
    googleSearchSchema.parse(input),
  );
};

export const sendFetch = async (
  input: FetchRequest,
): Promise<PlaygroundResponse> => {
  const { workspace } = await requireWorkspace();
  return callApi(
    workspace.id,
    "/v1/fetch",
    toFetchBody(fetchSchema.parse(input)),
  );
};

export const sendExtract = async (
  input: ExtractRequest,
): Promise<PlaygroundResponse> => {
  const { workspace } = await requireWorkspace();
  return callApi(workspace.id, "/v1/extract", extractSchema.parse(input));
};

export const readTask = async (taskId: string): Promise<PlaygroundResponse> => {
  const { workspace } = await requireWorkspace();
  return callApi(workspace.id, `/v1/async/task/${z.uuid().parse(taskId)}`);
};
