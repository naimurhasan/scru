import { ArrowLeft, ArrowRight, Diamond, Layers, List } from "lucide-react";
import type { ProductKey, ShowcaseProduct } from "@/lib/site/showcase";

const ICONS = {
  fetch: Layers,
  extract: ArrowRight,
  crawl: ArrowLeft,
  batch: List,
  browser: Diamond,
} as const;

type ShowcaseTabsProps = {
  products: ShowcaseProduct[];
  active: ProductKey;
  onSelect: (key: ProductKey) => void;
};

export function ShowcaseTabs({
  products,
  active,
  onSelect,
}: ShowcaseTabsProps) {
  return (
    <div
      role="tablist"
      className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-stone-800 bg-stone-900 p-1"
    >
      {products.map(({ key, label }) => {
        const Icon = ICONS[key];
        const selected = key === active;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(key)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
              selected
                ? "bg-stone-50 text-stone-950 ring-2 ring-teal-400/60"
                : "text-stone-300 hover:text-stone-50"
            }`}
          >
            <Icon
              className={`size-4 ${selected ? "text-violet-600" : "text-teal-300"}`}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
