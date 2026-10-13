import "server-only";
import { findWorkspaceByOwner } from "@scru/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const SIGN_IN = "/sign-in";

export const requireWorkspace = cache(async () => {
  const current = await auth.api.getSession({ headers: await headers() });
  if (!current) redirect(SIGN_IN);
  const workspace = await findWorkspaceByOwner(db, current.user.id);
  if (!workspace) redirect(SIGN_IN);
  return { user: current.user, workspace };
});
