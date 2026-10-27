import { NativeSelect } from "@/components/ui/native-select";
import { COUNTRIES } from "@/lib/playground/countries";

type CountrySelectProps = {
  id: string;
  value: string;
  anyLabel?: string;
  onChange: (country: string) => void;
};

export function CountrySelect({
  id,
  value,
  anyLabel,
  onChange,
}: CountrySelectProps) {
  return (
    <NativeSelect
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {anyLabel && <option value="">{anyLabel}</option>}
      {COUNTRIES.map(({ code, name }) => (
        <option key={code} value={code}>
          {name} ({code})
        </option>
      ))}
    </NativeSelect>
  );
}
