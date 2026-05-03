import { randomBytes } from "node:crypto";
import { hashApiKey } from "./hashApiKey.ts";

const PREFIX = "scru_";
const SECRET_BYTES = 32;
const PREVIEW_LENGTH = 4;

export type GeneratedApiKey = {
  key: string;
  hash: string;
  preview: string;
};

export const describeApiKey = (key: string): GeneratedApiKey => ({
  key,
  hash: hashApiKey(key),
  preview: `${PREFIX}…${key.slice(-PREVIEW_LENGTH)}`,
});

export const generateApiKey = (): GeneratedApiKey =>
  describeApiKey(PREFIX + randomBytes(SECRET_BYTES).toString("base64url"));
