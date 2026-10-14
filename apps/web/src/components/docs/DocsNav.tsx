import Link from "next/link";
import { DOCS_SECTIONS } from "@/lib/docs/docsSections";

export function DocsNav() {
  return (
    <nav className="grid gap-6 text-sm">
      {DOCS_SECTIONS.map(({ title, links }) => (
        <div key={title} className="grid gap-2">
          <p className="font-medium">{title}</p>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
