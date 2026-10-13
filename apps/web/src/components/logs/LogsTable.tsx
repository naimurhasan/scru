import type { RequestLogSummary } from "@scru/db";
import Link from "next/link";
import { StatusBadge } from "@/components/logs/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format/formatDateTime";
import { formatDuration } from "@/lib/format/formatDuration";
import { readQuery } from "@/lib/logs/readQuery";

export function LogsTable({ logs }: { logs: RequestLogSummary[] }) {
  if (logs.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No requests yet. Send one from the playground.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Engine</TableHead>
          <TableHead>Query</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Duration</TableHead>
          <TableHead className="text-right">Credits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              <Link
                href={`/dashboard/logs/${log.id}`}
                className="hover:text-foreground hover:underline"
              >
                {formatDateTime(log.createdAt)}
              </Link>
            </TableCell>
            <TableCell className="capitalize">{log.engine}</TableCell>
            <TableCell className="max-w-80 truncate">
              {readQuery(log.request)}
            </TableCell>
            <TableCell>
              <StatusBadge status={log.httpStatus} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatDuration(log.durationMs)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {log.creditsCharged}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
