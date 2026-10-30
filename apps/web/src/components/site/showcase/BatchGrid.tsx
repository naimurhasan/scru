import { Check } from "lucide-react";
import type { ShowcasePage } from "@/lib/site/showcase";
import { MockPage } from "./MockPage";

const CELLS = Array.from({ length: 15 }, (_, index) => index);

export function BatchGrid({ page }: { page: ShowcasePage }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <div className="pointer-events-none aspect-[4/3] overflow-hidden rounded-lg">
        <div className="w-[400%] origin-top-left scale-25">
          <MockPage page={page} product="batch" compact />
        </div>
      </div>
      {CELLS.map((cell) => (
        <div
          key={cell}
          style={{ animationDelay: `${cell * 60}ms` }}
          className="grid aspect-[4/3] place-items-center rounded-lg border border-teal-400/50 bg-stone-900 animate-in fade-in fill-mode-both"
        >
          <Check className="size-5 text-teal-300" />
        </div>
      ))}
    </div>
  );
}
