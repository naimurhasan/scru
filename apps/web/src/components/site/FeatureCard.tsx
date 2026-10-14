import type { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 [&_svg]:size-5 [&_svg]:text-muted-foreground">
      {icon}
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
