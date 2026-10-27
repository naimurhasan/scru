import type { FetchRequest } from "./types";

export const toFetchBody = ({
  url,
  output,
  jsRender,
  waitFor,
  premiumProxy,
  country,
}: FetchRequest) => {
  const rendered = jsRender || output === "screenshot";
  return {
    url,
    output,
    ...(rendered && { jsRender: true }),
    ...(rendered && waitFor.trim() && { waitFor: waitFor.trim() }),
    ...(premiumProxy && { premiumProxy: true }),
    ...(premiumProxy && country && { country }),
  };
};
