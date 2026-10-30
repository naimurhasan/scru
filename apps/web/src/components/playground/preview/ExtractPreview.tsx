import { RecordsTable } from "@/components/playground/preview/RecordsTable";
import { Badge } from "@/components/ui/badge";
import type { ExtractResult } from "@/lib/playground/readExtractResult";

export function ExtractPreview({ result }: { result: ExtractResult }) {
  const records = Array.isArray(result.data) ? result.data : [result.data];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{result.pageType}</Badge>
        <Badge variant="outline">
          Extractor version {result.extractor.version}
        </Badge>
        <Badge variant="outline">
          {records.length} {records.length === 1 ? "record" : "records"}
        </Badge>
      </div>
      <RecordsTable records={records} />
    </div>
  );
}
