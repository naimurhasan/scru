import { findRequestLog } from "@scru/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/logs/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format/formatDateTime";
import { formatDuration } from "@/lib/format/formatDuration";
import { prettyJson } from "@/lib/format/prettyJson";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Request" };

const idSchema = z.uuid();

export default async function LogPage({
  params,
}: PageProps<"/dashboard/logs/[id]">) {
  const { workspace } = await requireWorkspace();
  const id = idSchema.safeParse((await params).id);
  const log = id.success
    ? await findRequestLog(db, workspace.id, id.data)
    : null;
  if (!log) notFound();

  return (
    <>
      <PageHeader title="Request" description={formatDateTime(log.createdAt)} />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={log.httpStatus} />
        <Badge variant="outline" className="capitalize">
          {log.engine}
        </Badge>
        <Badge variant="outline">{formatDuration(log.durationMs)}</Badge>
        <Badge variant="outline">{log.creditsCharged} credits charged</Badge>
        <Badge variant="outline">
          {log.apiKeyId ? "API key" : "Playground"}
        </Badge>
      </div>
      <div className="grid gap-6">
        <section className="grid gap-2">
          <h2 className="text-sm font-medium">Request</h2>
          <CodeBlock code={prettyJson(log.request)} />
        </section>
        <section className="grid gap-2">
          <h2 className="text-sm font-medium">Response</h2>
          <CodeBlock code={prettyJson(log.response)} />
        </section>
      </div>
    </>
  );
}
