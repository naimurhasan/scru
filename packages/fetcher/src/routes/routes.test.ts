import { describe, expect, it } from "vitest";
import type { RouteRequest } from "../types.ts";
import { createWebshareRoutes } from "./createWebshareRoutes.ts";
import { webshareUsername } from "./webshareUsername.ts";

const request: RouteRequest = { country: null, sessionId: null, sticky: false };
const slotThree = () => 3;

describe("webshareUsername", () => {
  it("rotates by default", () => {
    expect(webshareUsername("acct", 10, request, slotThree)).toBe(
      "acct-rotate",
    );
  });

  it("rotates inside a country", () => {
    expect(
      webshareUsername("acct", 10, { ...request, country: "gb" }, slotThree),
    ).toBe("acct-GB-rotate");
  });

  it("holds one proxy when the caller needs a steady address", () => {
    expect(
      webshareUsername("acct", 10, { ...request, sticky: true }, slotThree),
    ).toBe("acct-3");
  });

  it("maps a session to the same slot every time", () => {
    const session = { ...request, sessionId: "checkout-42" };
    const first = webshareUsername("acct", 10, session, slotThree);

    expect(webshareUsername("acct", 10, session, slotThree)).toBe(first);
    expect(first).toMatch(/^acct-([1-9]|10)$/);
  });

  it("spreads sessions across the pool", () => {
    const slots = new Set(
      Array.from({ length: 50 }, (_, index) =>
        webshareUsername(
          "acct",
          10,
          { ...request, sessionId: `s${index}` },
          slotThree,
        ),
      ),
    );

    expect(slots.size).toBeGreaterThan(5);
  });
});

describe("createWebshareRoutes", () => {
  it("builds a proxy URL with escaped credentials", () => {
    const routes = createWebshareRoutes({
      username: "acct",
      password: "p@ss:word",
      poolSize: 10,
    });

    expect(routes.routeFor(request)).toEqual({
      proxy: "http://acct-rotate:p%40ss%3Aword@p.webshare.io:80",
    });
  });
});
