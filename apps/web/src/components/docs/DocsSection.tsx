import type { ReactNode } from "react";

type DocsSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function DocsSection({ id, title, children }: DocsSectionProps) {
  return (
    <section
      id={id}
      className="grid scroll-mt-20 gap-4 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0"
    >
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
