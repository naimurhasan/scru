import {
  Activity,
  BarChart3,
  FlaskConical,
  KeyRound,
  Webhook,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
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
        <SidebarLink href="/dashboard/playground">
          <FlaskConical />
          Playground
        </SidebarLink>
        <SidebarLink href="/dashboard/api-keys">
          <KeyRound />
          API keys
        </SidebarLink>
        <SidebarLink href="/dashboard/webhooks">
          <Webhook />
          Webhooks
        </SidebarLink>
        <SidebarLink href="/dashboard/logs">
          <Activity />
          Logs
        </SidebarLink>
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
