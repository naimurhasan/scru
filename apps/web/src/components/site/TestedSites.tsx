import { Badge } from "@/components/ui/badge";
import { TESTED_SITES } from "@/lib/site/testedSites";

export function TestedSites() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tested on real sites
        </h2>
        <p className="mt-2 text-muted-foreground">
          Paste one page and Extract learns the site. These came back as clean
          JSON with no selectors written by hand.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TESTED_SITES.map(({ name, category, page, records, fields }) => (
            <li key={name} className="rounded-lg border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{name}</span>
                <Badge variant="outline">{category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {page} · {records} records · {fields.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
