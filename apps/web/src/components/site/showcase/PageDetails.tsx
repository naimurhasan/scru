import type { ProductKey, ShowcasePage } from "@/lib/site/showcase";

const MARK = {
  extract: "rounded bg-violet-500/30 px-1 -mx-1",
  plain: "",
} as const;

const BAR = {
  crawl: "bg-teal-400/70",
  plain: "bg-stone-100",
} as const;

type PageDetailsProps = {
  page: ShowcasePage;
  product: ProductKey;
};

export function PageDetails({ page, product }: PageDetailsProps) {
  const mark = product === "extract" ? MARK.extract : MARK.plain;
  const bar = product === "crawl" ? BAR.crawl : BAR.plain;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className={`h-2 w-28 rounded-full ${bar}`} />
      <h3 className={`w-fit text-lg font-medium text-stone-50 ${mark}`}>
        {page.title}
      </h3>
      <p className={`w-fit text-sm text-stone-300 ${mark}`}>{page.subtitle}</p>
      <p className="flex items-baseline gap-4">
        <span className={`text-lg text-stone-50 ${mark}`}>{page.figure}</span>
        <span className={`text-xs text-stone-300 ${mark}`}>{page.note}</span>
      </p>
      <span className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className={`size-1.5 rounded-full ${
              product === "browser" && dot === 1
                ? "bg-teal-300"
                : "bg-stone-600"
            }`}
          />
        ))}
      </span>
      <span className="h-8 w-3/4 rounded-md bg-stone-700" />
      <span className={`h-1.5 w-full rounded-full ${bar}`} />
      <span className={`h-1.5 w-5/6 rounded-full ${bar}`} />
      <span className={`h-1.5 w-2/3 rounded-full ${bar}`} />
    </div>
  );
}
