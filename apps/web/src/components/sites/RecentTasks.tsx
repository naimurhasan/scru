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
import { formatDateTime } from "@/lib/format/formatDateTime";
import { describeSiteTask } from "@/lib/sites/describeSiteTask";
import { cn } from "@/lib/utils";

type RecentTasksProps = {
  tasks: Task[];
  basePath: string;
  selectedId: string | null;
};

export function RecentTasks({ tasks, basePath, selectedId }: RecentTasksProps) {
  if (tasks.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nothing yet. Start one above.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Pages</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Credits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow
            key={task.id}
            className={cn(task.id === selectedId && "bg-muted/60")}
          >
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDateTime(task.createdAt)}
            </TableCell>
            <TableCell className="max-w-96 truncate">
              <Link
                href={`${basePath}?task=${task.id}`}
                className="hover:underline"
              >
                {describeSiteTask(task.payload)}
              </Link>
            </TableCell>
            <TableCell>
              <TaskStatusBadge status={task.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {task.creditsCharged}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
