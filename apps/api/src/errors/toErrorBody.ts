import type { ApiError, ErrorCode } from "./ApiError.ts";

export type ErrorBody = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
  };
};

export const toErrorBody = (error: ApiError, now: Date): ErrorBody => ({
  success: false,
  error: {
    code: error.code,
    message: error.message,
    ...(error.details !== undefined && { details: error.details }),
    timestamp: now.toISOString(),
  },
});
