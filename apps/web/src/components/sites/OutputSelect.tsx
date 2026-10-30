import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

const OUTPUTS = [
  { value: "json", label: "JSON (fields worked out for you)" },
  { value: "markdown", label: "Markdown" },
  { value: "text", label: "Plain text" },
  { value: "html", label: "HTML" },
];

export function OutputSelect() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="output">Output</Label>
      <NativeSelect id="output" name="output" defaultValue="json">
        {OUTPUTS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
