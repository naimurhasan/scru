export type CreateKeyState = {
  key: string | null;
  error: string | null;
};

export const INITIAL_CREATE_KEY_STATE: CreateKeyState = {
  key: null,
  error: null,
};
