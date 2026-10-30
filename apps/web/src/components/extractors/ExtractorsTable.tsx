import type { StoredExtractor } from "@scru/core";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format/formatDateTime";

export function ExtractorsTable({
  extractors,
}: {
  extractors: StoredExtractor[];
}) {
  if (extractors.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No extractors yet. They appear here once a preparation finishes.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site</TableHead>
          <TableHead className="text-right">Version</TableHead>
          <TableHead>Page types</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {extractors.map((extractor) => (
          <TableRow key={extractor.id}>
            <TableCell>
              <Link
                href={`/dashboard/extractors/${extractor.id}`}
                className="font-medium hover:underline"
              >
                {extractor.host}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {extractor.version}
            </TableCell>
            <TableCell className="max-w-96 truncate text-muted-foreground">
              {extractor.pageTypes.map(({ name }) => name).join(", ")}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDateTime(extractor.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
