import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProductTabs } from "@/components/dashboard/ProductTabs";

type ProductPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ProductPage({
  title,
  description,
  children,
}: ProductPageProps) {
  return (
    <>
      <div className="mb-6">
        <ProductTabs />
      </div>
      <PageHeader title={title} description={description} />
      {children}
    </>
  );
}
