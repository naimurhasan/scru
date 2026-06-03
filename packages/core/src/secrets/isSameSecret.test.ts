import { describe, expect, it } from "vitest";
import { isSameSecret } from "./isSameSecret.ts";

describe("isSameSecret", () => {
  it("accepts the same secret", () => {
    expect(isSameSecret("s3cret-token", "s3cret-token")).toBe(true);
  });

  it("rejects a different secret of any length", () => {
    expect(isSameSecret("s3cret-tokeN", "s3cret-token")).toBe(false);
    expect(isSameSecret("short", "s3cret-token")).toBe(false);
    expect(isSameSecret("", "s3cret-token")).toBe(false);
  });
});
