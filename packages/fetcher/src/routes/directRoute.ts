import type { RouteProvider } from "../types.ts";

export const directRoute: RouteProvider = {
  name: "direct",
  nextRoute: () => ({}),
};
