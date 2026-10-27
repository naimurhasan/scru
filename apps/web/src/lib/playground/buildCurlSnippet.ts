const escapeSingleQuotes = (value: string) => value.replaceAll("'", "'\\''");

export const buildCurlSnippet = (
  apiUrl: string,
  path: string,
  body: unknown,
): string =>
  [
    `curl -X POST ${apiUrl}${path} \\`,
    `  -H "Authorization: Bearer $SCRU_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${escapeSingleQuotes(JSON.stringify(body))}'`,
  ].join("\n");
