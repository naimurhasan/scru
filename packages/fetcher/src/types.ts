import type { Page } from "playwright-core";

export type Route = {
  proxy?: string;
};

export type RouteProvider = {
  name: string;
  nextRoute: () => Route;
};

export type FetchedPage = {
  url: string;
  status: number;
  html: string;
};

export type BrowserProvider = {
  name: string;
  openPage: () => Promise<Page>;
  close: () => Promise<void>;
};

export type BrowserProviderOptions = {
  profileDir: string;
  route: Route;
  headless: boolean;
  locale: string;
};
