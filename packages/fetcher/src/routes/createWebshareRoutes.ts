import { randomInt } from "node:crypto";
import type { RouteProvider } from "../types.ts";
import { webshareUsername } from "./webshareUsername.ts";

export type WebshareAccount = {
  username: string;
  password: string;
  poolSize: number;
};

const ENDPOINT = "p.webshare.io:80";

export const createWebshareRoutes = ({
  username,
  password,
  poolSize,
}: WebshareAccount): RouteProvider => ({
  name: "webshare",
  routeFor: (request) => {
    const proxyUser = webshareUsername(username, poolSize, request, () =>
      randomInt(1, poolSize + 1),
    );
    return {
      proxy: `http://${encodeURIComponent(proxyUser)}:${encodeURIComponent(password)}@${ENDPOINT}`,
    };
  },
});
