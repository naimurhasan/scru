import type { RouteProvider, RouteRequest } from "../types.ts";

export const ANY_ROUTE: RouteRequest = {
  country: null,
  sessionId: null,
  sticky: false,
};

export const directRoute: RouteProvider = {
  name: "direct",
  routeFor: () => ({}),
};
