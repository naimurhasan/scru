import { createApiKey } from "../src/apiKeys/createApiKey.ts";
import { createDatabase } from "../src/client.ts";
import { requireEnv } from "../src/requireEnv.ts";
import { createWorkspace } from "../src/workspaces/createWorkspace.ts";

const STARTING_CREDITS = 500;

const { db, close } = createDatabase(requireEnv("DATABASE_URL"));

try {
  const workspace = await createWorkspace(db, {
    name: "Local workspace",
    credits: STARTING_CREDITS,
  });
  const apiKey = await createApiKey(db, {
    workspaceId: workspace.id,
    name: "Local key",
  });
  console.log(
    JSON.stringify(
      {
        workspaceId: workspace.id,
        credits: workspace.credits,
        apiKey: apiKey.key,
      },
      null,
      2,
    ),
  );
} finally {
  await close();
}
