import { Badge } from "@/components/ui/badge";

const VARIANTS = {
  delivered: "secondary",
  pending: "outline",
  failed: "destructive",
} as const;

const isKnownStatus = (status: string): status is keyof typeof VARIANTS =>
  status in VARIANTS;

export function DeliveryStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={isKnownStatus(status) ? VARIANTS[status] : "outline"}
      className="capitalize"
    >
      {status}
    </Badge>
  );
}
