import type { Metadata } from "next";
import { ProductPage } from "@/components/dashboard/ProductPage";
import { LatestCrawl } from "@/components/extractors/LatestCrawl";
import { CrawlForm } from "@/components/sites/CrawlForm";
import { RecentTasks } from "@/components/sites/RecentTasks";
import { requireWorkspace } from "@/lib/requireWorkspace";
import { loadSiteTasks } from "@/lib/sites/loadSiteTasks";

export const metadata: Metadata = { title: "Crawl" };

export default async function CrawlPage({
  searchParams,
}: PageProps<"/dashboard/crawl">) {
  const { workspace } = await requireWorkspace();
  const { task } = await searchParams;
  const { tasks, selected, pages } = await loadSiteTasks(
    workspace.id,
    "CRAWL",
    task,
  );

  return (
    <ProductPage
      title="Crawl"
      description="Start at a page, follow its links and collect every page as JSON, Markdown, text or HTML."
    >
      <div className="grid gap-8">
        <CrawlForm />
        {selected && (
          <LatestCrawl title="Crawl" task={selected} pages={pages} />
        )}
        <section className="grid gap-3">
          <h2 className="text-sm font-medium">Recent crawls</h2>
          <RecentTasks
            tasks={tasks}
            basePath="/dashboard/crawl"
            selectedId={selected?.id ?? null}
          />
        </section>
      </div>
    </ProductPage>
  );
}
