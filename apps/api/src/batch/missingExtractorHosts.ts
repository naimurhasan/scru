import type { StoredExtractor } from "@scru/core";

export const missingExtractorHosts = async (
  findLatestExtractor: (host: string) => Promise<StoredExtractor | null>,
  urls: string[],
): Promise<string[]> => {
  const hosts = [...new Set(urls.map((url) => new URL(url).hostname))];
  const found = await Promise.all(hosts.map(findLatestExtractor));
  return hosts.filter((_host, index) => found[index] === null);
};
