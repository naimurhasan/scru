import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toRecordColumns } from "@/lib/playground/toRecordColumns";

type RecordsTableProps = {
  records: Array<Record<string, string | null>>;
};

export function RecordsTable({ records }: RecordsTableProps) {
  const columns = toRecordColumns(records);

  return (
    <div className="max-h-[36rem] overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className="font-mono text-xs">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={index}>
              {columns.map((column) => {
                const value = record[column] ?? null;
                return (
                  <TableCell
                    key={column}
                    className="max-w-64 truncate"
                    title={value ?? undefined}
                  >
                    {value ?? "—"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
