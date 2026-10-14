import { CountrySelect } from "@/components/playground/CountrySelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PlaygroundRequest } from "@/lib/playground/types";

type PlaygroundFormProps = {
  request: PlaygroundRequest;
  pending: boolean;
  onChange: (request: PlaygroundRequest) => void;
  onSubmit: () => void;
};

export function PlaygroundForm({
  request,
  pending,
  onChange,
  onSubmit,
}: PlaygroundFormProps) {
  return (
    <Card>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="engine">Engine</Label>
            <Input id="engine" value="Google Search" readOnly disabled />
          </div>
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
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
          <p className="text-xs text-muted-foreground">
            The first page costs 5 credits and each extra page 2. Results
            usually arrive in about a second. Failed requests are free.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
