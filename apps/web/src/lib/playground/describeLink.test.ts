import { describe, expect, it } from "vitest";
import { describeLink } from "./describeLink";

describe("describeLink", () => {
  it("splits a link into a site name and a breadcrumb", () => {
    expect(
      describeLink("https://www.zoho.com/crm/small-business-crm-software/"),
    ).toEqual({
      site: "zoho.com",
      breadcrumb: "https://www.zoho.com › crm › small-business-crm-software",
    });
  });

  it("shows only the origin for a homepage", () => {
    expect(describeLink("https://serpapi.com/")).toEqual({
      site: "serpapi.com",
      breadcrumb: "https://serpapi.com",
    });
  });

  it("drops the query string and decodes the path", () => {
    expect(
      describeLink("https://example.com/caf%C3%A9/menu?utm=1").breadcrumb,
    ).toBe("https://example.com › café › menu");
  });

  it("returns the text unchanged when it is not a link", () => {
    expect(describeLink("not a link")).toEqual({
      site: "not a link",
      breadcrumb: "not a link",
    });
  });
});
