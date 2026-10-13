export const readQuery = (request: unknown): string =>
  typeof request === "object" &&
  request !== null &&
  "query" in request &&
  typeof request.query === "string"
    ? request.query
    : "—";
