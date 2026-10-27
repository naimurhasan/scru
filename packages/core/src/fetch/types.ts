export const FETCH_OUTPUTS = [
  "html",
  "markdown",
  "text",
  "screenshot",
] as const;

export type FetchOutput = (typeof FETCH_OUTPUTS)[number];

export type ProxyRequest = {
  country: string | null;
  sessionId: string | null;
};

export type JsInstruction =
  | { click: string }
  | { fill: { selector: string; value: string } }
  | { select: { selector: string; value: string } }
  | { press: string }
  | { wait: number }
  | { waitFor: string }
  | { scrollY: number };

export type InstructionReport = {
  instruction: JsInstruction;
  ok: boolean;
  durationMs: number;
  error: string | null;
};

export type RenderJob = {
  url: string;
  instructions: JsInstruction[];
  waitFor: string | null;
  waitMs: number;
  screenshot: boolean;
  blockResources: boolean;
  proxy: ProxyRequest | null;
};

export type FetchJob = RenderJob & {
  jsRender: boolean;
};

export type PageSnapshot = {
  url: string;
  status: number;
  html: string;
  screenshot: string | null;
  instructions: InstructionReport[];
};

export type PageFailureReason =
  "blocked" | "selector_not_found" | "navigation_failed" | "timeout";

export type PageOutcome =
  { ok: true; page: PageSnapshot } | { ok: false; reason: PageFailureReason };
