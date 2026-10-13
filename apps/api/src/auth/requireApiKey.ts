import { hashApiKey } from "@scru/core";
import { createMiddleware } from "hono/factory";
import type { ApiDeps, ApiEnv } from "../deps.ts";
import { ApiError } from "../errors/ApiError.ts";
import { parseBearerToken } from "./parseBearerToken.ts";

export const requireApiKey = (findApiKey: ApiDeps["findApiKey"]) =>
  createMiddleware<ApiEnv>(async (c, next) => {
    const token = parseBearerToken(c.req.header("Authorization"));
    if (!token)
      throw new ApiError(
        "UNAUTHORIZED",
        "Send your API key as: Authorization: Bearer <key>",
      );
    const apiKey = await findApiKey(hashApiKey(token));
    if (!apiKey)
      throw new ApiError("UNAUTHORIZED", "Invalid or revoked API key");
    c.set("apiKey", apiKey);
    await next();
  });
