import type { ReactNode } from "react";
import { EngineSelect } from "@/components/playground/EngineSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Engine } from "@/lib/playground/types";

type PlaygroundFormProps = {
  engine: Engine;
  pending: boolean;
  note: string;
  children: ReactNode;
  onEngineChange: (engine: Engine) => void;
  onSubmit: () => void;
};

export function PlaygroundForm({
  engine,
  pending,
  note,
  children,
  onEngineChange,
  onSubmit,
}: PlaygroundFormProps) {
  return (
    <Card>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="engine">Engine</Label>
            <EngineSelect value={engine} onChange={onEngineChange} />
          </div>
          {children}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
          <p className="text-xs text-muted-foreground">{note}</p>
        </form>
      </CardContent>
    </Card>
  );
}
