import { Search } from "lucide-react";

export function PreviewRelatedSearches({ queries }: { queries: string[] }) {
  if (queries.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-xl">People also search for</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {queries.map((query) => (
          <li
            key={query}
            className="flex items-center gap-3 rounded-full bg-[#f1f3f4] px-4 py-3 text-sm"
          >
            <Search className="size-4 shrink-0 text-[#70757a]" />
            <span className="truncate">{query}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
