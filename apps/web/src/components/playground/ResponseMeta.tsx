import { StatusBadge } from "@/components/logs/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format/formatDuration";
import type { PlaygroundResponse } from "@/lib/playground/types";

export function ResponseMeta({ response }: { response: PlaygroundResponse }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={response.status} />
      <Badge variant="outline">{formatDuration(response.durationMs)}</Badge>
      <Badge variant="outline">
        {response.creditsCharged ?? 0} credits charged
      </Badge>
    </div>
  );
}
