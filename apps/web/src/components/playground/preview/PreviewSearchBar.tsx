import { Search } from "lucide-react";

export function PreviewSearchBar({ query }: { query: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-[#ebebeb] px-6 py-4">
      <span className="text-2xl font-medium tracking-tight text-[#5f6368]">
        Results
      </span>
      <div className="flex h-11 min-w-0 max-w-[40rem] flex-1 items-center gap-3 rounded-full border border-[#dfe1e5] px-5 shadow-[0_1px_6px_rgba(32,33,36,0.18)]">
        <span className="min-w-0 flex-1 truncate text-base">{query}</span>
        <Search className="size-5 shrink-0 text-[#4285f4]" />
      </div>
    </div>
  );
}
