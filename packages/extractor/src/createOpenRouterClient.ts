import type { ChatMessage } from "./prompts.ts";

export type CompleteJson = (messages: ChatMessage[]) => Promise<unknown>;

export type OpenRouterOptions = {
  apiKey: string;
  model: string;
};

type Completion = {
  choices?: Array<{ message?: { content?: string } }>;
};

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 90_000;

export const createOpenRouterClient =
  ({ apiKey, model }: OpenRouterOptions): CompleteJson =>
  async (messages) => {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: "json_object" },
        reasoning: { enabled: false },
      }),
    });
    if (!response.ok) throw new Error(`The model answered ${response.status}`);
    const completion = (await response.json()) as Completion;
    return JSON.parse(completion.choices?.[0]?.message?.content ?? "null");
  };
