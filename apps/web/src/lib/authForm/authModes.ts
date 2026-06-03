export type AuthMode = "sign-in" | "sign-up";

export type AuthModeCopy = {
  title: string;
  description: string;
  submit: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
};

export const AUTH_MODES: Record<AuthMode, AuthModeCopy> = {
  "sign-in": {
    title: "Sign in to scru",
    description: "Use the email and password you registered with.",
    submit: "Sign in",
    switchPrompt: "No account yet?",
    switchLabel: "Create one",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your account",
    description: "You start with 500 free credits.",
    submit: "Create account",
    switchPrompt: "Already registered?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
  },
};
