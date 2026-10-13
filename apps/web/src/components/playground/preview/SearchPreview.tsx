import { PreviewKnowledgePanel } from "@/components/playground/preview/PreviewKnowledgePanel";
import { PreviewOrganicResult } from "@/components/playground/preview/PreviewOrganicResult";
import { PreviewPeopleAlsoAsk } from "@/components/playground/preview/PreviewPeopleAlsoAsk";
import { PreviewRelatedSearches } from "@/components/playground/preview/PreviewRelatedSearches";
import { PreviewSearchBar } from "@/components/playground/preview/PreviewSearchBar";
import type { SearchResult } from "@/lib/playground/readSearchResult";
import { cn } from "@/lib/utils";

type SearchPreviewProps = {
  query: string;
  result: SearchResult;
};

export function SearchPreview({ query, result }: SearchPreviewProps) {
  const panel = result.knowledgePanel;

  return (
    <div className="@container max-h-[36rem] overflow-auto rounded-lg border bg-white font-[arial,sans-serif] text-[#202124]">
      <PreviewSearchBar query={query} />
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)] gap-8 p-6",
          panel && "@4xl:grid-cols-[minmax(0,1fr)_20rem]",
        )}
      >
        {panel && (
          <div className="@4xl:order-last">
            <PreviewKnowledgePanel panel={panel} />
          </div>
        )}
        <div className="grid max-w-[41rem] grid-cols-[minmax(0,1fr)] gap-8">
          {result.organicResults.length === 0 && (
            <p className="text-sm text-[#4d5156]">
              No results were found for this search.
            </p>
          )}
          {result.organicResults.map((organic) => (
            <PreviewOrganicResult key={organic.position} result={organic} />
          ))}
          <PreviewPeopleAlsoAsk
            questions={result.peopleAlsoAsk.map(({ question }) => question)}
          />
          <PreviewRelatedSearches
            queries={result.relatedSearches.map(
              ({ query: related }) => related,
            )}
          />
        </div>
      </div>
    </div>
  );
}
