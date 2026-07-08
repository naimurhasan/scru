import { listWebhookDeliveries } from "@scru/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SigningSecret } from "@/components/webhooks/SigningSecret";
import { WebhookDeliveriesTable } from "@/components/webhooks/WebhookDeliveriesTable";
import { WebhookEndpointForm } from "@/components/webhooks/WebhookEndpointForm";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "Webhooks" };

const RECENT_DELIVERIES = 50;

export default async function WebhooksPage() {
  const { workspace } = await requireWorkspace();
  const deliveries = await listWebhookDeliveries(
    db,
    workspace.id,
    RECENT_DELIVERIES,
  );

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Get a request on your own server when an async task finishes, instead of polling for it."
      />
      <div className="grid gap-8">
        <WebhookEndpointForm url={workspace.webhookUrl} />
        <SigningSecret secret={workspace.webhookSecret} />
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Recent deliveries</h2>
          <WebhookDeliveriesTable deliveries={deliveries} />
        </section>
      </div>
    </>
  );
}
