"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  "Reading a sample of the site's pages",
  "Working out the kinds of pages and the fields on each",
  "Checking every field on pages it has not seen",
];

const TICK_MS = 1_000;

export function PreparingSite({ host }: { host: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <LoaderCircle className="size-5 animate-spin text-violet-500" />
          <p className="font-medium">Learning {host}</p>
          <span className="ml-auto text-sm tabular-nums text-muted-foreground">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
        </div>
        <ol className="grid gap-2 text-sm text-muted-foreground">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="tabular-nums">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          This is the first request for this site, so its fields are being
          worked out. It usually takes one to three minutes, and the page&apos;s
          data appears here when it is done. After that, every page of the site
          comes back in seconds.
        </p>
      </CardContent>
    </Card>
  );
}
