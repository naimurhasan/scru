"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarLinkProps = {
  href: string;
  exact?: boolean;
  children: ReactNode;
};

export function SidebarLink({
  href,
  exact = false,
  children,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground [&_svg]:size-4",
        active && "bg-sidebar-accent font-medium text-sidebar-foreground",
      )}
    >
      {children}
    </Link>
  );
}
