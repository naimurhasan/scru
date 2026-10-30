import { describe, expect, it } from "vitest";
import { readErrorMessage } from "./readErrorMessage";

describe("readErrorMessage", () => {
  it("prefers the first detail over the general message", () => {
    expect(
      readErrorMessage({
        success: false,
        error: {
          message: "The request is invalid",
          details: [{ field: "url", message: "Enter a public address" }],
        },
      }),
    ).toBe("Enter a public address");
  });

  it("uses the general message when there are no details", () => {
    expect(readErrorMessage({ error: { message: "Not enough credits" } })).toBe(
      "Not enough credits",
    );
  });

  it("falls back for an unknown body", () => {
    expect(readErrorMessage("oops")).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
