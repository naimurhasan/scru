import { describe, expect, it } from "vitest";
import { normalizeLink } from "./normalizeLink.ts";

describe("normalizeLink", () => {
  it("keeps an external link unchanged", () => {
    expect(normalizeLink("https://crm.org/best")).toBe("https://crm.org/best");
  });

  it("unwraps a tracked Google link", () => {
    expect(normalizeLink("/url?sa=t&q=https://crm.org/best&ved=abc")).toBe(
      "https://crm.org/best",
    );
    expect(normalizeLink("/url?sa=t&url=https%3A%2F%2Fcrm.org%2Fbest")).toBe(
      "https://crm.org/best",
    );
  });

  it("makes an unresolved Google redirect absolute", () => {
    expect(normalizeLink("/goto?url=CAES")).toBe(
      "https://www.google.com/goto?url=CAES",
    );
  });

  it("keeps a tracked link whose target is not a web address", () => {
    expect(normalizeLink("/url?q=CAES")).toBe(
      "https://www.google.com/url?q=CAES",
    );
  });

  it("returns null without a usable link", () => {
    expect(normalizeLink(undefined)).toBeNull();
    expect(normalizeLink("")).toBeNull();
    expect(normalizeLink("http://")).toBeNull();
  });
});
