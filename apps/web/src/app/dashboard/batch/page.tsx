import type { Metadata } from "next";
import { ProductPage } from "@/components/dashboard/ProductPage";
import { BatchForm } from "@/components/sites/BatchForm";
import { BatchResult } from "@/components/sites/BatchResult";
import { RecentTasks } from "@/components/sites/RecentTasks";
import { requireWorkspace } from "@/lib/requireWorkspace";
import { loadSiteTasks } from "@/lib/sites/loadSiteTasks";

export const metadata: Metadata = { title: "Batch" };

export default async function BatchPage({
  searchParams,
}: PageProps<"/dashboard/batch">) {
  const { workspace } = await requireWorkspace();
  const { task } = await searchParams;
  const { tasks, selected, pages } = await loadSiteTasks(
    workspace.id,
    "BATCH",
    task,
  );

  return (
    <ProductPage
      title="Batch"
      description="Send a list of addresses as one job and collect every result when it finishes."
    >
      <div className="grid gap-8">
        <BatchForm />
        {selected && <BatchResult task={selected} pages={pages} />}
        <section className="grid gap-3">
          <h2 className="text-sm font-medium">Recent batches</h2>
          <RecentTasks
            tasks={tasks}
            basePath="/dashboard/batch"
            selectedId={selected?.id ?? null}
          />
        </section>
      </div>
    </ProductPage>
  );
}
