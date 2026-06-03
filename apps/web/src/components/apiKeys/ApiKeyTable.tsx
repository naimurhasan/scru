import type { ApiKeySummary } from "@scru/db";
import { RevokeApiKeyButton } from "@/components/apiKeys/RevokeApiKeyButton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format/formatDateTime";

export function ApiKeyTable({ apiKeys }: { apiKeys: ApiKeySummary[] }) {
  if (apiKeys.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No keys yet. Create one to call the API from your own code.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.map((apiKey) => (
          <TableRow key={apiKey.id}>
            <TableCell className="font-medium">{apiKey.name}</TableCell>
            <TableCell className="font-mono text-xs">
              {apiKey.keyPreview}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(apiKey.createdAt)}
            </TableCell>
            <TableCell>
              <Badge variant={apiKey.revokedAt ? "destructive" : "secondary"}>
                {apiKey.revokedAt ? "Revoked" : "Active"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {!apiKey.revokedAt && <RevokeApiKeyButton apiKeyId={apiKey.id} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
