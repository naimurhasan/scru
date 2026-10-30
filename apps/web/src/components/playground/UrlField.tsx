import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UrlFieldProps = {
  value: string;
  placeholder: string;
  onChange: (url: string) => void;
};

export function UrlField({ value, placeholder, onChange }: UrlFieldProps) {
  return (
    <div className="grid gap-2 sm:col-span-full">
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        type="url"
        required
        maxLength={2_000}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
