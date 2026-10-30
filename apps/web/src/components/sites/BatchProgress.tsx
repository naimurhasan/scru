import { Check, X } from "lucide-react";
import type { CrawledPage } from "@scru/core";
import { cn } from "@/lib/utils";

const MAX_CELLS = 100;

type BatchProgressProps = {
  total: number;
  pages: CrawledPage[];
};

export function BatchProgress({ total, pages }: BatchProgressProps) {
  const byPosition = new Map(pages.map((page) => [page.position, page]));
  const cells = Array.from({ length: Math.min(total, MAX_CELLS) }, (_, index) =>
    byPosition.get(index),
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="tabular-nums">
          {pages.length} / {total}
        </span>
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div
            style={{ width: `${(pages.length / Math.max(total, 1)) * 100}%` }}
            className="h-full rounded-full bg-teal-500 transition-[width]"
          />
        </div>
      </div>
      <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-20">
        {cells.map((page, index) => (
          <div
            key={index}
            title={page?.url}
            className={cn(
              "grid aspect-square place-items-center rounded border",
              page === undefined && "animate-pulse bg-muted",
              page?.error === null && "border-teal-500/60 text-teal-600",
              page &&
                page.error !== null &&
                "border-destructive/60 text-destructive",
            )}
          >
            {page &&
              (page.error === null ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
