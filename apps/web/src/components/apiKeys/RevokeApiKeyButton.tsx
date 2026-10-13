import { revokeApiKeyAction } from "@/app/dashboard/api-keys/actions";
import { Button } from "@/components/ui/button";

export function RevokeApiKeyButton({ apiKeyId }: { apiKeyId: string }) {
  return (
    <form action={revokeApiKeyAction}>
      <input type="hidden" name="id" value={apiKeyId} />
      <Button type="submit" variant="destructive" size="sm">
        Revoke
      </Button>
    </form>
  );
}
