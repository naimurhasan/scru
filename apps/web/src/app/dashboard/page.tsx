import { getRequestStats, listRequestLogs } from "@scru/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { LogsTable } from "@/components/logs/LogsTable";
import { db } from "@/lib/db";
import { formatDuration } from "@/lib/format/formatDuration";
import { formatSuccessRate } from "@/lib/format/formatSuccessRate";
import { startOfToday } from "@/lib/format/startOfToday";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Overview" };

const RECENT_LOGS = 5;

export default async function OverviewPage() {
  const { workspace } = await requireWorkspace();
  const [stats, recentLogs] = await Promise.all([
    getRequestStats(db, workspace.id, startOfToday(new Date())),
    listRequestLogs(db, workspace.id, RECENT_LOGS),
  ]);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Today's usage for this workspace."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Credits left"
          value={workspace.credits.toLocaleString("en-US")}
          hint="5 credits per Google search"
        />
        <StatCard
          label="Requests today"
          value={String(stats.total)}
          hint={`${stats.succeeded} succeeded`}
        />
        <StatCard
          label="Success rate"
          value={formatSuccessRate(stats.succeeded, stats.total)}
          hint="Failed requests are not charged"
        />
        <StatCard
          label="Average latency"
          value={
            stats.averageDurationMs === null
              ? "—"
              : formatDuration(stats.averageDurationMs)
          }
          hint="Successful requests today"
        />
      </div>
      <h2 className="mt-10 mb-4 text-lg font-semibold">Recent requests</h2>
      <LogsTable logs={recentLogs} />
    </>
  );
}
