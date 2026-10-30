import type { ReactNode } from "react";

type SidebarGroupProps = {
  title: string;
  children: ReactNode;
};

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="mt-4 grid gap-1">
      <p className="px-3 pb-1 text-xs text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
