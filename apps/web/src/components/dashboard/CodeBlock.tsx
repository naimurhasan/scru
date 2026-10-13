import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  className?: string;
};

export function CodeBlock({ code, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "max-h-[36rem] overflow-auto rounded-lg border bg-background p-4 font-mono text-xs leading-relaxed",
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  );
}
