import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Braces,
  KeyRound,
  Layers,
  List,
  Search,
  Webhook,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { SidebarGroup } from "@/components/dashboard/SidebarGroup";
import { SidebarLink } from "@/components/dashboard/SidebarLink";

type SidebarProps = {
  workspaceName: string;
  credits: number;
  email: string;
};

export function Sidebar({ workspaceName, credits, email }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3">
      <div className="px-3 py-2">
        <p className="text-base font-semibold">scru</p>
        <p className="truncate text-xs text-muted-foreground">
          {workspaceName}
        </p>
      </div>
      <nav className="mt-4 grid gap-1">
        <SidebarLink href="/dashboard" exact>
          <BarChart3 />
          Overview
        </SidebarLink>
        <SidebarLink href="/dashboard/logs">
          <Activity />
          Activity log
        </SidebarLink>
        <SidebarGroup title="Playground">
          <SidebarLink href="/dashboard/fetch">
            <Layers />
            Fetch
          </SidebarLink>
          <SidebarLink href="/dashboard/extract">
            <Braces />
            Extract
          </SidebarLink>
          <SidebarLink href="/dashboard/crawl">
            <ArrowLeft />
            Crawl
          </SidebarLink>
          <SidebarLink href="/dashboard/batch">
            <List />
            Batch
          </SidebarLink>
          <SidebarLink href="/dashboard/search">
            <Search />
            Google search
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup title="Sites">
          <SidebarLink href="/dashboard/extractors">
            <ArrowRight />
            Learned sites
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup title="Account">
          <SidebarLink href="/dashboard/api-keys">
            <KeyRound />
            API keys
          </SidebarLink>
          <SidebarLink href="/dashboard/webhooks">
            <Webhook />
            Webhooks
          </SidebarLink>
        </SidebarGroup>
      </nav>
      <div className="mt-auto grid grid-cols-[minmax(0,1fr)] gap-3">
        <div className="rounded-lg border border-sidebar-border px-3 py-2">
          <p className="text-xs text-muted-foreground">Credits left</p>
          <p className="text-lg font-semibold tabular-nums">
            {credits.toLocaleString("en-US")}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 px-3">
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
