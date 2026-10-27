import { NativeSelect } from "@/components/ui/native-select";
import type { Engine } from "@/lib/playground/types";

const ENGINES: Array<{ value: Engine; label: string }> = [
  { value: "google", label: "Google Search" },
  { value: "fetch", label: "Fetch any page" },
];

type EngineSelectProps = {
  value: Engine;
  onChange: (engine: Engine) => void;
};

export function EngineSelect({ value, onChange }: EngineSelectProps) {
  return (
    <NativeSelect
      id="engine"
      value={value}
      onChange={(event) => onChange(event.target.value as Engine)}
    >
      {ENGINES.map(({ value: engine, label }) => (
        <option key={engine} value={engine}>
          {label}
        </option>
      ))}
    </NativeSelect>
  );
}
