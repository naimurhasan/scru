import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ExtractorField } from "@/lib/extractors/types";

type FieldRowProps = {
  field: ExtractorField;
  onChange: (field: ExtractorField) => void;
  onRemove: () => void;
};

export function FieldRow({ field, onChange, onRemove }: FieldRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Input
          aria-label="Field name"
          maxLength={60}
          value={field.name}
          title={field.description || undefined}
          onChange={(event) => onChange({ ...field, name: event.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input
          aria-label="Selector"
          maxLength={300}
          className="font-mono text-xs"
          value={field.selector}
          onChange={(event) =>
            onChange({ ...field, selector: event.target.value })
          }
        />
      </TableCell>
      <TableCell>
        <Input
          aria-label="Attribute"
          maxLength={60}
          placeholder="text"
          className="font-mono text-xs"
          value={field.attribute ?? ""}
          onChange={(event) =>
            onChange({ ...field, attribute: event.target.value || null })
          }
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${field.name}`}
          onClick={onRemove}
        >
          <X />
        </Button>
      </TableCell>
    </TableRow>
  );
}
