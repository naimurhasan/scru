import { COUNTRIES } from "@/lib/playground/countries";

type CountrySelectProps = {
  id: string;
  value: string;
  onChange: (country: string) => void;
};

export function CountrySelect({ id, value, onChange }: CountrySelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {COUNTRIES.map(({ code, name }) => (
        <option key={code} value={code}>
          {name} ({code})
        </option>
      ))}
    </select>
  );
}
