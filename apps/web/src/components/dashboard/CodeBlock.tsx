import { CopyButton } from "@/components/dashboard/CopyButton";
import { JsonCode } from "@/components/dashboard/JsonCode";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  label?: string;
  language?: "json" | "text";
  className?: string;
};

export function CodeBlock({
  code,
  label,
  language = "text",
  className,
}: CodeBlockProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-background">
      <div className="flex h-9 items-center justify-between border-b px-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre
        className={cn(
          "max-h-[36rem] overflow-y-auto p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]",
          className,
        )}
      >
        {language === "json" ? <JsonCode code={code} /> : <code>{code}</code>}
      </pre>
    </div>
  );
}
