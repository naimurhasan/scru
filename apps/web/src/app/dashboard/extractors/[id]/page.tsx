import { findExtractor, listCrawlPages, listTasksOfType } from "@scru/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ExtractorEditor } from "@/components/extractors/ExtractorEditor";
import { LatestCrawl } from "@/components/extractors/LatestCrawl";
import { StartCrawlForm } from "@/components/extractors/StartCrawlForm";
import { TryPagePanel } from "@/components/extractors/TryPagePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { isJsonCrawlOf } from "@/lib/extractors/isJsonCrawlOf";
import { formatDateTime } from "@/lib/format/formatDateTime";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Extractor" };

const idSchema = z.uuid();
const RECENT_CRAWLS = 20;
const SHOWN_PAGES = 100;

export default async function ExtractorPage({
  params,
}: PageProps<"/dashboard/extractors/[id]">) {
  const { workspace } = await requireWorkspace();
  const id = idSchema.safeParse((await params).id);
  const extractor = id.success
    ? await findExtractor(db, workspace.id, id.data)
    : null;
  if (!extractor) notFound();

  const crawls = await listTasksOfType(
    db,
    workspace.id,
    "CRAWL",
    RECENT_CRAWLS,
  );
  const latestCrawl =
    crawls.find((task) => isJsonCrawlOf(task.payload, extractor.host)) ?? null;
  const crawledPages = latestCrawl
    ? await listCrawlPages(db, latestCrawl.id, {
        after: -1,
        limit: SHOWN_PAGES,
      })
    : null;

  return (
    <>
      <PageHeader
        title={`${extractor.host} · version ${extractor.version}`}
        description={`Created ${formatDateTime(extractor.createdAt)}. Try it on a page, crawl the site as JSON, or adjust its fields.`}
      />
      <Tabs defaultValue="try">
        <TabsList>
          <TabsTrigger value="try">Try a page</TabsTrigger>
          <TabsTrigger value="crawl">Crawl</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>
        <TabsContent value="try" className="pt-4">
          <TryPagePanel host={extractor.host} />
        </TabsContent>
        <TabsContent value="crawl" className="grid gap-8 pt-4">
          <StartCrawlForm host={extractor.host} />
          {latestCrawl && crawledPages && (
            <LatestCrawl task={latestCrawl} pages={crawledPages.pages} />
          )}
        </TabsContent>
        <TabsContent value="fields" className="pt-4">
          <ExtractorEditor
            key={extractor.id}
            id={extractor.id}
            pageTypes={extractor.pageTypes}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
