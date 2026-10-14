import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="text-base font-semibold">
          scru
        </Link>
        <nav className="flex gap-5 text-sm text-muted-foreground">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
