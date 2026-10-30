import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Playground } from "@/components/playground/Playground";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Google search" };

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Google search"
        description="Send a search and see the results as JSON. Requests use your workspace's credits and show in Logs."
      />
      <Playground apiUrl={env.API_URL} engine="google" />
    </>
  );
}
