import { HTTPException } from "hono/http-exception";
import { ApiError } from "./ApiError.ts";

const BAD_REQUEST = 400;

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (error instanceof HTTPException && error.status === BAD_REQUEST)
    return new ApiError("VALIDATION_ERROR", error.message);
  return new ApiError("INTERNAL_ERROR", "Something went wrong on our side");
};
