import type { Metadata } from "next";
import { ProductPage } from "@/components/dashboard/ProductPage";
import { ExtractPlayground } from "@/components/playground/ExtractPlayground";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Extract" };

export default function ExtractPage() {
  return (
    <ProductPage
      title="Extract"
      description="Paste any page and get its data as JSON. A new site is learned on the first request."
    >
      <ExtractPlayground apiUrl={env.API_URL} />
    </ProductPage>
  );
}
