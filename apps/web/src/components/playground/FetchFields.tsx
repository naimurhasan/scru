import type { FetchOutput } from "@scru/core";
import { CountrySelect } from "@/components/playground/CountrySelect";
import { ToggleField } from "@/components/playground/ToggleField";
import { UrlField } from "@/components/playground/UrlField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  FETCH_OUTPUT_LABELS,
  FETCH_OUTPUT_VALUES,
} from "@/lib/playground/fetchOutputs";
import type { FetchRequest } from "@/lib/playground/types";

type FetchFieldsProps = {
  request: FetchRequest;
  onChange: (request: FetchRequest) => void;
};

export function FetchFields({ request, onChange }: FetchFieldsProps) {
  const rendered = request.jsRender || request.output === "screenshot";

  return (
    <>
      <UrlField
        value={request.url}
        placeholder="https://example.com/"
        onChange={(url) => onChange({ ...request, url })}
      />
      <div className="grid gap-2">
        <Label htmlFor="output">Output</Label>
        <NativeSelect
          id="output"
          value={request.output}
          onChange={(event) =>
            onChange({ ...request, output: event.target.value as FetchOutput })
          }
        >
          {FETCH_OUTPUT_VALUES.map((output) => (
            <option key={output} value={output}>
              {FETCH_OUTPUT_LABELS[output]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <ToggleField
        id="jsRender"
        label="Render JavaScript"
        hint="For pages that build their content in the page. Always on for screenshots."
        checked={rendered}
        onChange={(jsRender) => onChange({ ...request, jsRender })}
      />
      {rendered && (
        <div className="grid gap-2">
          <Label htmlFor="waitFor">Wait for element (optional)</Label>
          <Input
            id="waitFor"
            maxLength={500}
            placeholder=".product-list"
            value={request.waitFor}
            onChange={(event) =>
              onChange({ ...request, waitFor: event.target.value })
            }
          />
        </div>
      )}
      <ToggleField
        id="premiumProxy"
        label="Premium proxy"
        hint="Route the request through another address, optionally in a chosen country."
        checked={request.premiumProxy}
        onChange={(premiumProxy) => onChange({ ...request, premiumProxy })}
      />
      {request.premiumProxy && (
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <CountrySelect
            id="country"
            value={request.country}
            anyLabel="Any country"
            onChange={(country) => onChange({ ...request, country })}
          />
        </div>
      )}
    </>
  );
}
