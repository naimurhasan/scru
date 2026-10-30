import { listExtractors, listTasksOfType } from "@scru/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ExtractorsTable } from "@/components/extractors/ExtractorsTable";
import { PreparationsTable } from "@/components/extractors/PreparationsTable";
import { PrepareExtractorForm } from "@/components/extractors/PrepareExtractorForm";
import { RefreshWhilePending } from "@/components/extractors/RefreshWhilePending";
import { db } from "@/lib/db";
import { hasPendingTask } from "@/lib/extractors/hasPendingTask";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Extractors" };

const RECENT_PREPARATIONS = 10;

export default async function ExtractorsPage() {
  const { workspace } = await requireWorkspace();
  const [preparations, extractors] = await Promise.all([
    listTasksOfType(db, workspace.id, "EXTRACTOR", RECENT_PREPARATIONS),
    listExtractors(db, workspace.id),
  ]);

  return (
    <>
      <PageHeader
        title="Extractors"
        description="Prepare a site once, then turn any of its pages into JSON with the Extract engine."
      />
      <RefreshWhilePending pending={hasPendingTask(preparations)} />
      <div className="grid gap-8">
        <PrepareExtractorForm />
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Recent preparations</h2>
          <PreparationsTable tasks={preparations} />
        </section>
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Extractors</h2>
          <ExtractorsTable extractors={extractors} />
        </section>
      </div>
    </>
  );
}
