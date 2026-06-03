import { CodeBlock } from "@/components/dashboard/CodeBlock";

export function NewKeyNotice({ apiKey }: { apiKey: string }) {
  return (
    <div
      role="status"
      className="grid gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4"
    >
      <p className="text-sm font-medium">
        Copy your key now. It will not be shown again.
      </p>
      <CodeBlock code={apiKey} className="select-all" />
    </div>
  );
}
