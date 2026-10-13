export type PlaygroundRequest = {
  query: string;
  country: string;
};

export type PlaygroundResponse = {
  status: number;
  durationMs: number;
  creditsCharged: number | null;
  creditsRemaining: number | null;
  body: unknown;
};

export type PlaygroundRun = {
  request: PlaygroundRequest;
  response: PlaygroundResponse;
};
