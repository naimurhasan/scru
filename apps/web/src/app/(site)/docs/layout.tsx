import { DocsNav } from "@/components/docs/DocsNav";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[12rem_minmax(0,1fr)]">
      <aside className="md:sticky md:top-20 md:h-fit">
        <DocsNav />
      </aside>
      <div className="grid max-w-3xl gap-12">{children}</div>
    </div>
  );
}
