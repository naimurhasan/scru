import { ApiError } from "./ApiError.ts";

export const invalidField = (field: string, message: string) =>
  new ApiError("VALIDATION_ERROR", "The request is invalid", [
    { field, message },
  ]);
