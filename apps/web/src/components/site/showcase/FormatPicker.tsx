import { FETCH_FORMATS, type FetchFormat } from "@/lib/site/showcase";

type FormatPickerProps = {
  active: FetchFormat;
  onSelect: (format: FetchFormat) => void;
};

export function FormatPicker({ active, onSelect }: FormatPickerProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-stone-700 bg-stone-900 p-1.5">
      {FETCH_FORMATS.map((format) => (
        <button
          key={format}
          type="button"
          aria-pressed={format === active}
          onClick={() => onSelect(format)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            format === active
              ? "bg-stone-50 text-stone-950"
              : "text-stone-300 hover:text-stone-50"
          }`}
        >
          {format}
        </button>
      ))}
    </div>
  );
}
