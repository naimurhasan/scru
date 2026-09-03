import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-8 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">scru</span>
        <Link href="/docs" className="hover:text-foreground">
          Docs
        </Link>
        <Link href="/docs/reference" className="hover:text-foreground">
          API reference
        </Link>
        <Link href="/pricing" className="hover:text-foreground">
          Pricing
        </Link>
        <span className="ml-auto">A portfolio project.</span>
      </div>
    </footer>
  );
}
