import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { Preparation } from "@/lib/extractors/describePreparation";

export function PreparedNotice({ preparation }: { preparation: Preparation }) {
  return (
    <p className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/5 px-4 py-3 text-sm">
      <Sparkles className="size-4 text-violet-500" />
      Site learned{preparation.summary && `: ${preparation.summary}`}.
      {preparation.extractorId && (
        <Link
          href={`/dashboard/extractors/${preparation.extractorId}`}
          className="font-medium underline"
        >
          Review its fields
        </Link>
      )}
    </p>
  );
}
