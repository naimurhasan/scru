import { listRequestLogs } from "@scru/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LogsTable } from "@/components/logs/LogsTable";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Logs" };

const PAGE_SIZE = 100;

export default async function LogsPage() {
  const { workspace } = await requireWorkspace();
  const logs = await listRequestLogs(db, workspace.id, PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Logs"
        description="The last 100 requests made with your keys or from the playground."
      />
      <LogsTable logs={logs} />
    </>
  );
}
