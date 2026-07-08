import { createHmac } from "node:crypto";

export const signWebhookPayload = (
  secret: string,
  timestamp: number,
  body: string,
): string => {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
};
