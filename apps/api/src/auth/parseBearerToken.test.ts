import { describe, expect, it } from "vitest";
import { parseBearerToken } from "./parseBearerToken.ts";

describe("parseBearerToken", () => {
  it("reads the token from a bearer header", () => {
    expect(parseBearerToken("Bearer scru_abc")).toBe("scru_abc");
    expect(parseBearerToken("bearer   scru_abc ")).toBe("scru_abc");
  });

  it("returns null for anything else", () => {
    expect(parseBearerToken(undefined)).toBeNull();
    expect(parseBearerToken("")).toBeNull();
    expect(parseBearerToken("Bearer")).toBeNull();
    expect(parseBearerToken("Basic scru_abc")).toBeNull();
    expect(parseBearerToken("Bearer scru abc")).toBeNull();
  });
});
