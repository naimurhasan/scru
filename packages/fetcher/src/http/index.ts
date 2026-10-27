export { detectBlock, type BlockReason } from "../google/detectBlock.ts";
export type { FetchedPage } from "../types.ts";
export { buildSearchUrl, type SearchUrlInput } from "./buildSearchUrl.ts";
export {
  createSessionClient,
  type SessionClient,
} from "./createSessionClient.ts";
export { createSessionClients } from "./createSessionClients.ts";
export { fetchSearchPages, type HttpSearchInput } from "./fetchSearchPages.ts";
export { pickImpersonation } from "./pickImpersonation.ts";
export {
  createFetchPage,
  type FetchPageDeps,
} from "../page/createFetchPage.ts";
export { createHttpFetcher } from "../page/createHttpFetcher.ts";
export {
  detectChallenge,
  type ChallengeReason,
} from "../page/detectChallenge.ts";
export {
  createWebshareRoutes,
  type WebshareAccount,
} from "../routes/createWebshareRoutes.ts";
export { ANY_ROUTE, directRoute } from "../routes/directRoute.ts";
