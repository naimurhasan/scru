import { CountrySelect } from "@/components/playground/CountrySelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoogleSearchRequest } from "@/lib/playground/types";

type GoogleSearchFieldsProps = {
  request: GoogleSearchRequest;
  onChange: (request: GoogleSearchRequest) => void;
};

export function GoogleSearchFields({
  request,
  onChange,
}: GoogleSearchFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="query">Query</Label>
        <Textarea
          id="query"
          rows={3}
          required
          maxLength={500}
          value={request.query}
          onChange={(event) =>
            onChange({ ...request, query: event.target.value })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="country">Country</Label>
        <CountrySelect
          id="country"
          value={request.country}
          onChange={(country) => onChange({ ...request, country })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pages">Pages</Label>
        <Input
          id="pages"
          type="number"
          min={1}
          max={10}
          step={1}
          required
          value={request.pages}
          onChange={(event) =>
            onChange({ ...request, pages: event.target.valueAsNumber })
          }
        />
      </div>
    </>
  );
}
