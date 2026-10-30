import type { CrawledPage } from "@scru/core";
import { isTaskPending } from "@scru/core";
import type { Task } from "@scru/db";
import { CodeBlock } from "@/components/dashboard/CodeBlock";
import { CrawlPagesTable } from "@/components/extractors/CrawlPagesTable";
import { RefreshWhilePending } from "@/components/extractors/RefreshWhilePending";
import { TaskStatusBadge } from "@/components/extractors/TaskStatusBadge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/formatDateTime";
import { prettyJson } from "@/lib/format/prettyJson";

type LatestCrawlProps = {
  title?: string;
  task: Task;
  pages: CrawledPage[];
};

export function LatestCrawl({
  title = "Latest crawl",
  task,
  pages,
}: LatestCrawlProps) {
  const records = pages.flatMap(({ data }) =>
    data === null ? [] : Array.isArray(data) ? data : [data],
  );

  return (
    <section className="grid gap-4">
      <RefreshWhilePending pending={isTaskPending(task.status)} />
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <TaskStatusBadge status={task.status} />
        <Badge variant="outline">{formatDateTime(task.createdAt)}</Badge>
        <Badge variant="outline">{pages.length} pages</Badge>
        <Badge variant="outline">{records.length} records</Badge>
        {task.creditsCharged > 0 && (
          <Badge variant="outline">{task.creditsCharged} credits</Badge>
        )}
      </div>
      {task.errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {task.errorMessage}
        </p>
      )}
      <CrawlPagesTable pages={pages} />
      {records.length > 0 && (
        <CodeBlock
          code={prettyJson(records)}
          label="All records"
          language="json"
        />
      )}
    </section>
  );
}
