import { describeLink } from "@/lib/playground/describeLink";
import type { OrganicResult } from "@/lib/playground/readSearchResult";

export function PreviewOrganicResult({ result }: { result: OrganicResult }) {
  const { site, breadcrumb } = describeLink(result.link);

  return (
    <article>
      <div className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] text-xs font-medium uppercase text-[#5f6368]">
          {site.charAt(0)}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm">{site}</p>
          <p className="truncate text-xs text-[#4d5156]">{breadcrumb}</p>
        </div>
      </div>
      <a
        href={result.link}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-1 block text-xl leading-snug text-[#1a0dab] hover:underline"
      >
        {result.title}
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">
        {result.snippet}
      </p>
    </article>
  );
}
