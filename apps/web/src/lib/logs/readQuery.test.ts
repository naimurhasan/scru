import { describe, expect, it } from "vitest";
import { readQuery } from "./readQuery";

describe("readQuery", () => {
  it("reads the query from a stored request", () => {
    expect(readQuery({ query: "best crm", country: "US" })).toBe("best crm");
  });

  it("falls back to a dash for anything else", () => {
    expect(readQuery(null)).toBe("—");
    expect(readQuery({ query: 42 })).toBe("—");
    expect(readQuery("best crm")).toBe("—");
  });
});
