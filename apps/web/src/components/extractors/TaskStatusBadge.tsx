import { Badge } from "@/components/ui/badge";

const VARIANTS = {
  COMPLETED: "secondary",
  QUEUED: "outline",
  PROCESSING: "outline",
  FAILED: "destructive",
} as const;

const isKnownStatus = (status: string): status is keyof typeof VARIANTS =>
  status in VARIANTS;

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={isKnownStatus(status) ? VARIANTS[status] : "outline"}
      className="capitalize"
    >
      {status.toLowerCase()}
    </Badge>
  );
}
