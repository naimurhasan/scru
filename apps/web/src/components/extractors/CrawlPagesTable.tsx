import type { CrawledPage } from "@scru/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countRecords } from "@/lib/extractors/countRecords";
import { describePageResult } from "@/lib/sites/describePageResult";

export function CrawlPagesTable({ pages }: { pages: CrawledPage[] }) {
  if (pages.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No pages yet. They appear here as they are collected.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Page</TableHead>
          <TableHead>Result</TableHead>
          <TableHead className="text-right">Records</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableRow key={page.position}>
            <TableCell className="max-w-96 truncate" title={page.url}>
              {page.url}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {describePageResult(page)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {countRecords(page.data)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
