"use client";

import { ArrowLeft, ArrowRight, Layers, List } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCT_LINKS } from "@/lib/products/products";
import { cn } from "@/lib/utils";

const ICONS = {
  fetch: Layers,
  extract: ArrowRight,
  crawl: ArrowLeft,
  batch: List,
} as const;

export function ProductTabs() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PRODUCT_LINKS.map(({ key, label, href, hint }) => {
        const Icon = ICONS[key];
        const active = pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            title={hint}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-accent",
              active && "border-violet-500/60 bg-violet-500/5 font-medium",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                active ? "text-violet-500" : "text-teal-500",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
