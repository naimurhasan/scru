import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireWorkspace } from "@/lib/requireWorkspace";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { user, workspace } = await requireWorkspace();

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        workspaceName={workspace.name}
        credits={workspace.credits}
        email={user.email}
      />
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
