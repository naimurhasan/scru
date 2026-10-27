import type { ProxyRequest } from "@scru/core";
import type { FetchedPage } from "@scru/fetcher";

const OK = 200;

export const createRobotsFetcher =
  (
    fetchHttp: (
      url: string,
      proxy: ProxyRequest | null,
    ) => Promise<FetchedPage>,
  ) =>
  async (
    origin: string,
    proxy: ProxyRequest | null,
  ): Promise<string | null> => {
    const robots = await fetchHttp(`${origin}/robots.txt`, proxy).catch(
      () => null,
    );
    return robots?.status === OK ? robots.html : null;
  };
