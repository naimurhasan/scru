import type { KnowledgePanel } from "@/lib/playground/readSearchResult";

export function PreviewKnowledgePanel({ panel }: { panel: KnowledgePanel }) {
  return (
    <aside className="h-fit rounded-xl border border-[#dadce0] p-5">
      <h3 className="text-2xl">{panel.title}</h3>
      {panel.subtitle && (
        <p className="text-sm text-[#70757a]">{panel.subtitle}</p>
      )}
      {panel.description && (
        <p className="mt-3 text-sm leading-relaxed text-[#4d5156]">
          {panel.description}
        </p>
      )}
      {panel.facts.length > 0 && (
        <dl className="mt-3 grid gap-2 text-sm">
          {panel.facts.map(({ label, value }) => (
            <div key={label}>
              <dt className="inline font-semibold">{label}: </dt>
              <dd className="inline text-[#4d5156]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
