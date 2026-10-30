export type PrepareFormState = {
  error: string | null;
  submitted: boolean;
};

export const INITIAL_PREPARE_FORM_STATE: PrepareFormState = {
  error: null,
  submitted: false,
};
