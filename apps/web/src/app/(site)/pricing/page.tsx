import { calculateCredits } from "@scru/core";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Pricing" };

const STARTING_CREDITS = 500;

const COSTS = [
  {
    request: "Sync search, one page",
    credits: calculateCredits({ pages: 1, mode: "sync" }),
  },
  {
    request: "Async task, one page",
    credits: calculateCredits({ pages: 1, mode: "async" }),
  },
  {
    request: "Each extra page",
    credits:
      calculateCredits({ pages: 2, mode: "async" }) -
      calculateCredits({ pages: 1, mode: "async" }),
  },
  { request: "Failed or timed-out request", credits: 0 },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Requests are paid in credits. Every new account starts with{" "}
        {STARTING_CREDITS} free credits.
      </p>

      <Table className="mt-10">
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead className="text-right">Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {COSTS.map(({ request, credits }) => (
            <TableRow key={request}>
              <TableCell>{request}</TableCell>
              <TableCell className="text-right tabular-nums">
                {credits}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-10 grid gap-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          You are charged only for results that come back. A three-page sync
          search that returns two pages costs{" "}
          {calculateCredits({ pages: 2, mode: "sync" })} credits, not{" "}
          {calculateCredits({ pages: 3, mode: "sync" })}.
        </p>
        <p>
          Every workspace can send 10 requests a second and run 2 sync searches
          at once. Async tasks wait in a queue and do not count against that.
        </p>
        <p>scru is a portfolio project, so credits are not sold.</p>
      </div>

      <Link
        href="/sign-up"
        className={buttonVariants({ size: "lg", className: "mt-10" })}
      >
        Get {STARTING_CREDITS} free credits
      </Link>
    </div>
  );
}
