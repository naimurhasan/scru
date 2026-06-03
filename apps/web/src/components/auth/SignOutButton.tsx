"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Sign out"
      onClick={signOut}
    >
      <LogOut />
    </Button>
  );
}
