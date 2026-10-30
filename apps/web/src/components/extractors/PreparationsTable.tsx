import type { Task } from "@scru/db";
import Link from "next/link";
import { TaskStatusBadge } from "@/components/extractors/TaskStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { describePreparation } from "@/lib/extractors/describePreparation";
import { formatDateTime } from "@/lib/format/formatDateTime";

export function PreparationsTable({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nothing prepared yet. Enter a site above to start.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Result</TableHead>
          <TableHead className="text-right">Credits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const { url, summary, extractorId } = describePreparation(task);
          return (
            <TableRow key={task.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(task.createdAt)}
              </TableCell>
              <TableCell className="max-w-80 truncate" title={url ?? undefined}>
                {url ?? "—"}
              </TableCell>
              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>
              <TableCell className="max-w-80 truncate text-muted-foreground">
                {extractorId ? (
                  <Link
                    href={`/dashboard/extractors/${extractorId}`}
                    className="text-foreground hover:underline"
                  >
                    {summary}
                  </Link>
                ) : (
                  (task.errorMessage ?? summary ?? "—")
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {task.creditsCharged}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
