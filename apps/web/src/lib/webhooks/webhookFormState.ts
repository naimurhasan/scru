export type WebhookFormState = {
  error: string | null;
  saved: boolean;
};

export const INITIAL_WEBHOOK_FORM_STATE: WebhookFormState = {
  error: null,
  saved: false,
};
