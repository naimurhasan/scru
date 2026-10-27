import { describe, expect, it } from "vitest";
import { toFetchBody } from "./toFetchBody";
import type { FetchRequest } from "./types";

const request: FetchRequest = {
  url: "https://books.toscrape.com/",
  output: "markdown",
  jsRender: false,
  waitFor: "",
  premiumProxy: false,
  country: "",
};

describe("toFetchBody", () => {
  it("sends only the fields that are in use", () => {
    expect(toFetchBody(request)).toEqual({
      url: "https://books.toscrape.com/",
      output: "markdown",
    });
  });

  it("drops waitFor unless the page is rendered", () => {
    expect(toFetchBody({ ...request, waitFor: ".price" })).not.toHaveProperty(
      "waitFor",
    );
    expect(
      toFetchBody({ ...request, jsRender: true, waitFor: " .price " }),
    ).toMatchObject({ jsRender: true, waitFor: ".price" });
  });

  it("renders whenever a screenshot is asked for", () => {
    expect(toFetchBody({ ...request, output: "screenshot" })).toMatchObject({
      jsRender: true,
    });
  });

  it("sends a country only with a premium proxy", () => {
    expect(toFetchBody({ ...request, country: "GB" })).not.toHaveProperty(
      "country",
    );
    expect(
      toFetchBody({ ...request, premiumProxy: true, country: "GB" }),
    ).toMatchObject({ premiumProxy: true, country: "GB" });
  });
});
