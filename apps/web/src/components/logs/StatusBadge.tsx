import { Badge } from "@/components/ui/badge";

const FIRST_ERROR_STATUS = 400;

export function StatusBadge({ status }: { status: number }) {
  return (
    <Badge variant={status < FIRST_ERROR_STATUS ? "secondary" : "destructive"}>
      {status}
    </Badge>
  );
}
