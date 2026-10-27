import { ApiError } from "./ApiError.ts";

type Issue = {
  path: PropertyKey[];
  message: string;
};

export const toValidationError = (issues: Issue[]): ApiError =>
  new ApiError(
    "VALIDATION_ERROR",
    "The request is invalid",
    issues.map(({ path, message }) => ({
      field: path.map(String).join("."),
      message,
    })),
  );
