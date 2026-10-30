import { Plus } from "lucide-react";
import { FieldRow } from "@/components/extractors/FieldRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExtractorField, PageType } from "@/lib/extractors/types";

const NEW_FIELD: ExtractorField = {
  name: "",
  description: "",
  selector: "",
  attribute: null,
};

type PageTypeFieldsProps = {
  pageType: PageType;
  fields: ExtractorField[];
  onChange: (fields: ExtractorField[]) => void;
};

export function PageTypeFields({
  pageType,
  fields,
  onChange,
}: PageTypeFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {pageType.name}
          <Badge variant="outline">
            {Math.round(pageType.fillRate * 100)}% filled when prepared
          </Badge>
        </CardTitle>
        <CardDescription className="grid gap-1">
          <span>
            Pages like <code className="font-mono">{pageType.pattern}</code>
          </span>
          <span>
            {pageType.itemSelector === null ? (
              "One record per page"
            ) : (
              <>
                One record for each{" "}
                <code className="font-mono">{pageType.itemSelector}</code>
              </>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Selector</TableHead>
              <TableHead>Attribute</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <FieldRow
                key={index}
                field={field}
                onChange={(changed) =>
                  onChange(
                    fields.map((current, at) =>
                      at === index ? changed : current,
                    ),
                  )
                }
                onRemove={() =>
                  onChange(fields.filter((_, at) => at !== index))
                }
              />
            ))}
          </TableBody>
        </Table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => onChange([...fields, NEW_FIELD])}
        >
          <Plus />
          Add field
        </Button>
      </CardContent>
    </Card>
  );
}
