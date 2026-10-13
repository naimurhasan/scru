import { listApiKeys } from "@scru/db";
import type { Metadata } from "next";
import { ApiKeyTable } from "@/components/apiKeys/ApiKeyTable";
import { CreateApiKeyForm } from "@/components/apiKeys/CreateApiKeyForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/requireWorkspace";

export const metadata: Metadata = { title: "API keys" };

export default async function ApiKeysPage() {
  const { workspace } = await requireWorkspace();
  const apiKeys = await listApiKeys(db, workspace.id);

  return (
    <>
      <PageHeader
        title="API keys"
        description="Keys authenticate your requests. A key gives full access to this workspace, so keep it secret."
      />
      <div className="grid gap-8">
        <CreateApiKeyForm />
        <ApiKeyTable apiKeys={apiKeys} />
      </div>
    </>
  );
}
