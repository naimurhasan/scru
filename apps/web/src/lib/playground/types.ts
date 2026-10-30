import type { FetchOutput } from "@scru/core";

export type Engine = "google" | "fetch" | "extract";

export type GoogleSearchRequest = {
  query: string;
  country: string;
  pages: number;
};

export type FetchRequest = {
  url: string;
  output: FetchOutput;
  jsRender: boolean;
  waitFor: string;
  premiumProxy: boolean;
  country: string;
};

export type ExtractRequest = {
  url: string;
};

export type PlaygroundResponse = {
  status: number;
  durationMs: number;
  creditsCharged: number | null;
  creditsRemaining: number | null;
  body: unknown;
};

export type PlaygroundRun =
  | {
      engine: "google";
      request: GoogleSearchRequest;
      response: PlaygroundResponse;
    }
  | { engine: "fetch"; request: FetchRequest; response: PlaygroundResponse }
  | {
      engine: "extract";
      request: ExtractRequest;
      response: PlaygroundResponse;
    };
