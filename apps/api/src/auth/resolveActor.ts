import { hashApiKey, isSameSecret } from "@scru/core";
import type { RequestActor } from "@scru/db";
import type { ApiConfig, ApiDeps } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { parseBearerToken } from "./parseBearerToken.ts";

export type AuthHeaders = {
  authorization: string | undefined;
  internalToken: string | undefined;
  workspaceId: string | undefined;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unauthorized = (message: string) => new ApiError("UNAUTHORIZED", message);

const resolveInternalActor = async (
  deps: Pick<ApiDeps, "findWorkspaceActor">,
  config: ApiConfig,
  { internalToken, workspaceId }: AuthHeaders,
): Promise<RequestActor> => {
  if (!internalToken || !isSameSecret(internalToken, config.internalToken))
    throw unauthorized("Invalid internal token");
  if (!workspaceId || !UUID.test(workspaceId))
    throw unauthorized("Missing or malformed workspace id");
  const actor = await deps.findWorkspaceActor(workspaceId);
  if (!actor) throw unauthorized("Unknown workspace");
  return actor;
};

const resolveKeyActor = async (
  deps: Pick<ApiDeps, "findApiKey">,
  { authorization }: AuthHeaders,
): Promise<RequestActor> => {
  const token = parseBearerToken(authorization);
  if (!token)
    throw unauthorized("Send your API key as: Authorization: Bearer <key>");
  const actor = await deps.findApiKey(hashApiKey(token));
  if (!actor) throw unauthorized("Invalid or revoked API key");
  return actor;
};

export const resolveActor = (
  deps: Pick<ApiDeps, "findApiKey" | "findWorkspaceActor">,
  config: ApiConfig,
  headers: AuthHeaders,
): Promise<RequestActor> =>
  headers.internalToken === undefined
    ? resolveKeyActor(deps, headers)
    : resolveInternalActor(deps, config, headers);
