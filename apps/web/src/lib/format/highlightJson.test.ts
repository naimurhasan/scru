import { describe, expect, it } from "vitest";
import { highlightJson } from "./highlightJson";

const kinds = (code: string) =>
  highlightJson(code)
    .filter(({ kind }) => kind !== "plain")
    .map(({ kind, text }) => `${kind}:${text}`);

describe("highlightJson", () => {
  it("tells keys from string values", () => {
    expect(kinds('{"title": "Best CRM"}')).toEqual([
      'key:"title"',
      'string:"Best CRM"',
    ]);
  });

  it("marks numbers, booleans and null", () => {
    expect(kinds('{"a": 1, "b": -2.5e3, "c": true, "d": null}')).toEqual([
      'key:"a"',
      "number:1",
      'key:"b"',
      "number:-2.5e3",
      'key:"c"',
      "literal:true",
      'key:"d"',
      "literal:null",
    ]);
  });

  it("does not treat words inside strings as literals or numbers", () => {
    expect(kinds('{"q": "true 42 null"}')).toEqual([
      'key:"q"',
      'string:"true 42 null"',
    ]);
  });

  it("keeps escaped quotes inside a string", () => {
    expect(kinds('{"q": "say \\"hi\\""}')).toEqual([
      'key:"q"',
      'string:"say \\"hi\\""',
    ]);
  });

  it("loses no characters", () => {
    const code = JSON.stringify(
      {
        success: true,
        result: { list: [1, "two", null], nested: { ok: false } },
      },
      null,
      2,
    );
    expect(
      highlightJson(code)
        .map(({ text }) => text)
        .join(""),
    ).toBe(code);
  });
});
