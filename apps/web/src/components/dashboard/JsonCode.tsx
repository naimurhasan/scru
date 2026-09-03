import { highlightJson, type JsonTokenKind } from "@/lib/format/highlightJson";

const COLORS: Record<JsonTokenKind, string> = {
  key: "text-sky-300",
  string: "text-emerald-300",
  number: "text-amber-300",
  literal: "text-violet-300",
  plain: "text-muted-foreground",
};

export function JsonCode({ code }: { code: string }) {
  return (
    <code>
      {highlightJson(code).map(({ kind, text }, index) => (
        <span key={index} className={COLORS[kind]}>
          {text}
        </span>
      ))}
    </code>
  );
}
