import { describe, expect, it } from "vitest";
import { describeApiKey, generateApiKey } from "./generateApiKey.ts";
import { hashApiKey } from "./hashApiKey.ts";

describe("generateApiKey", () => {
  it("creates a prefixed key with a matching hash", () => {
    const { key, hash } = generateApiKey();
    expect(key).toMatch(/^scru_[A-Za-z0-9_-]{43}$/);
    expect(hash).toBe(hashApiKey(key));
  });

  it("creates a different key every time", () => {
    expect(generateApiKey().key).not.toBe(generateApiKey().key);
  });

  it("previews only the last four characters", () => {
    expect(describeApiKey("scru_abcdefghWXYZ").preview).toBe("scru_…WXYZ");
  });
});

describe("hashApiKey", () => {
  it("is a stable sha256 hex digest", () => {
    expect(hashApiKey("scru_test")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey("scru_test")).toBe(hashApiKey("scru_test"));
    expect(hashApiKey("scru_test")).not.toBe(hashApiKey("scru_other"));
  });
});
