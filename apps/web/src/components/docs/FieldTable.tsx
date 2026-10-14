import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocField } from "@/lib/docs/docFields";

export function FieldTable({ fields }: { fields: DocField[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map(({ name, type, description }) => (
          <TableRow key={name}>
            <TableCell className="align-top font-mono text-xs">
              {name}
            </TableCell>
            <TableCell className="align-top text-xs text-muted-foreground">
              {type}
            </TableCell>
            <TableCell className="whitespace-normal text-sm">
              {description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
