export type JsonTokenKind = "key" | "string" | "number" | "literal" | "plain";

export type JsonToken = {
  kind: JsonTokenKind;
  text: string;
};

const TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

const classify = (match: RegExpExecArray): JsonTokenKind => {
  if (match[1] !== undefined) return match[2] ? "key" : "string";
  return match[3] !== undefined ? "literal" : "number";
};

export const highlightJson = (code: string): JsonToken[] => {
  const tokens: JsonToken[] = [];
  let cursor = 0;
  for (const match of code.matchAll(TOKEN)) {
    const start = match.index;
    if (start > cursor)
      tokens.push({ kind: "plain", text: code.slice(cursor, start) });
    const quoted = match[1];
    if (quoted !== undefined && match[2]) {
      tokens.push({ kind: "key", text: quoted });
      tokens.push({ kind: "plain", text: match[2] });
    } else {
      tokens.push({ kind: classify(match), text: match[0] });
    }
    cursor = start + match[0].length;
  }
  if (cursor < code.length)
    tokens.push({ kind: "plain", text: code.slice(cursor) });
  return tokens;
};
