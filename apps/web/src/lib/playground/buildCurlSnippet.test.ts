import { describe, expect, it } from "vitest";
import { buildCurlSnippet } from "./buildCurlSnippet";

describe("buildCurlSnippet", () => {
  it("builds a runnable curl command", () => {
    expect(
      buildCurlSnippet("http://localhost:4000", "/v1/monitor/google", {
        query: "best crm",
        country: "US",
        pages: 2,
      }),
    ).toBe(
      [
        "curl -X POST http://localhost:4000/v1/monitor/google \\",
        '  -H "Authorization: Bearer $SCRU_API_KEY" \\',
        '  -H "Content-Type: application/json" \\',
        `  -d '{"query":"best crm","country":"US","pages":2}'`,
      ].join("\n"),
    );
  });

  it("keeps a query with a single quote inside the shell string", () => {
    expect(
      buildCurlSnippet("http://localhost:4000", "/v1/monitor/google", {
        query: "what's a crm",
        country: "US",
        pages: 1,
      }),
    ).toContain(`what'\\''s a crm`);
  });
});
