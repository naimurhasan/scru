import type { WebhookDelivery } from "@scru/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeliveryStatusBadge } from "@/components/webhooks/DeliveryStatusBadge";
import { formatDateTime } from "@/lib/format/formatDateTime";

type WebhookDeliveriesTableProps = {
  deliveries: WebhookDelivery[];
};

export function WebhookDeliveriesTable({
  deliveries,
}: WebhookDeliveriesTableProps) {
  if (deliveries.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No deliveries yet. They appear here when an async task finishes.
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Response</TableHead>
          <TableHead className="text-right">Attempts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((delivery) => (
          <TableRow key={delivery.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDateTime(delivery.createdAt)}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {delivery.event}
            </TableCell>
            <TableCell className="max-w-80 truncate" title={delivery.url}>
              {delivery.url}
            </TableCell>
            <TableCell>
              <DeliveryStatusBadge status={delivery.status} />
            </TableCell>
            <TableCell
              className="text-right tabular-nums"
              title={delivery.lastError ?? undefined}
            >
              {delivery.httpStatus ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {delivery.attempts}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
