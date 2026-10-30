import type { ShowcaseOutput } from "@/lib/site/showcase";

export function OutputCard({ file, status, lines, progress }: ShowcaseOutput) {
  return (
    <div className="w-full rounded-xl border border-stone-700 bg-stone-950/95 font-mono text-[13px] shadow-2xl shadow-black/50 backdrop-blur">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-2.5">
        <span className="text-stone-300">{file}</span>
        <span className="text-teal-300">{status}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 leading-6 text-stone-200">
        {lines.join("\n")}
      </pre>
      {progress !== undefined && (
        <div className="px-4 pb-4">
          <div className="h-1.5 rounded-full bg-stone-800">
            <div
              style={{ width: `${progress * 100}%` }}
              className="h-full rounded-full bg-teal-300"
            />
          </div>
          <p className="mt-4 text-stone-400">results ready</p>
        </div>
      )}
    </div>
  );
}
