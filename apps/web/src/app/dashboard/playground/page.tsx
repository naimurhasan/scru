import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Playground } from "@/components/playground/Playground";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return (
    <>
      <PageHeader
        title="Playground"
        description="Send a request and see the response. Requests use your workspace's credits and show in Logs."
      />
      <Playground apiUrl={env.API_URL} />
    </>
  );
}
