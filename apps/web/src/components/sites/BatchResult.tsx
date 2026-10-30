import type { CrawledPage } from "@scru/core";
import type { Task } from "@scru/db";
import { LatestCrawl } from "@/components/extractors/LatestCrawl";
import { BatchProgress } from "@/components/sites/BatchProgress";
import { countBatchUrls } from "@/lib/sites/countBatchUrls";

type BatchResultProps = {
  task: Task;
  pages: CrawledPage[];
};

export function BatchResult({ task, pages }: BatchResultProps) {
  return (
    <div className="grid gap-4">
      <BatchProgress total={countBatchUrls(task.payload)} pages={pages} />
      <LatestCrawl title="Batch" task={task} pages={pages} />
    </div>
  );
}
