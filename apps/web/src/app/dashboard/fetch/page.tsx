import type { Metadata } from "next";
import { ProductPage } from "@/components/dashboard/ProductPage";
import { Playground } from "@/components/playground/Playground";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Fetch" };

export default function FetchPage() {
  return (
    <ProductPage
      title="Fetch"
      description="Get any page as HTML, Markdown, plain text or a screenshot."
    >
      <Playground apiUrl={env.API_URL} engine="fetch" />
    </ProductPage>
  );
}
