import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PlaygroundFormProps = {
  pending: boolean;
  note: string;
  children: ReactNode;
  onSubmit: () => void;
};

export function PlaygroundForm({
  pending,
  note,
  children,
  onSubmit,
}: PlaygroundFormProps) {
  return (
    <Card>
      <CardContent>
        <form
          className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <div className="flex flex-wrap items-center gap-4 sm:col-span-full">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send request"}
            </Button>
            <p className="text-xs text-muted-foreground">{note}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
