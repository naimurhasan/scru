"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/authClient";
import { AUTH_MODES, type AuthMode } from "@/lib/authForm/authModes";

const DASHBOARD = "/dashboard";
const FALLBACK_ERROR = "Something went wrong. Please try again.";

const authenticate = (mode: AuthMode, form: FormData) => {
  const email = String(form.get("email"));
  const password = String(form.get("password"));
  return mode === "sign-up"
    ? authClient.signUp.email({
        name: String(form.get("name")),
        email,
        password,
      })
    : authClient.signIn.email({ email, password });
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const copy = AUTH_MODES[mode];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (form: FormData) =>
    startTransition(async () => {
      const result = await authenticate(mode, form);
      if (result.error) {
        setError(result.error.message ?? FALLBACK_ERROR);
        return;
      }
      router.push(DASHBOARD);
      router.refresh();
    });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(new FormData(event.currentTarget));
        }}
      >
        <CardContent className="grid gap-4">
          {mode === "sign-up" && (
            <AuthField name="name" label="Name" autoComplete="name" />
          )}
          <AuthField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <AuthField
            name="password"
            label="Password"
            type="password"
            minLength={8}
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait…" : copy.submit}
          </Button>
          <p className="text-sm text-muted-foreground">
            {copy.switchPrompt}{" "}
            <Link href={copy.switchHref} className="text-foreground underline">
              {copy.switchLabel}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
