import { MousePointer2 } from "lucide-react";
import type { ProductKey, ShowcasePage } from "@/lib/site/showcase";
import { PageDetails } from "./PageDetails";
import { Scene } from "./Scene";

type MockPageProps = {
  page: ShowcasePage;
  product: ProductKey;
  compact?: boolean;
};

export function MockPage({ page, product, compact = false }: MockPageProps) {
  return (
    <div className="rounded-2xl border border-stone-700 bg-stone-900">
      <div className="flex items-center gap-3 border-b border-stone-800 px-4 py-2.5">
        <span className="flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-2 rounded-full bg-stone-600" />
          ))}
        </span>
        <span className="truncate font-mono text-xs text-stone-300">
          {page.url}
        </span>
        {product === "browser" ? (
          <span className="relative ml-auto">
            <MousePointer2 className="size-5 fill-violet-500 text-violet-300" />
            <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-teal-400 text-[10px] font-semibold text-stone-950">
              1
            </span>
          </span>
        ) : (
          <span className="ml-auto size-4 rounded border border-stone-500" />
        )}
      </div>
      <div
        className={`grid grid-cols-[2fr_3fr] gap-6 ${compact ? "p-3" : "p-5"}`}
      >
        <Scene scene={page.scene} />
        <PageDetails page={page} product={product} />
      </div>
    </div>
  );
}
