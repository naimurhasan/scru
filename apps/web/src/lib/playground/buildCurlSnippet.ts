import type { PlaygroundRequest } from "./types";

const escapeSingleQuotes = (value: string) => value.replaceAll("'", "'\\''");

export const buildCurlSnippet = (
  apiUrl: string,
  request: PlaygroundRequest,
): string =>
  [
    `curl -X POST ${apiUrl}/v1/monitor/google \\`,
    `  -H "Authorization: Bearer $SCRU_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${escapeSingleQuotes(JSON.stringify(request))}'`,
  ].join("\n");
