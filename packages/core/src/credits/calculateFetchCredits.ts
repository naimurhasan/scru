export type FetchCreditInput = {
  jsRender: boolean;
  premiumProxy: boolean;
};

const PLAIN = 1;
const RENDERED = 5;
const PROXIED = 10;
const RENDERED_AND_PROXIED = 25;

export const calculateFetchCredits = ({
  jsRender,
  premiumProxy,
}: FetchCreditInput): number => {
  if (premiumProxy) return jsRender ? RENDERED_AND_PROXIED : PROXIED;
  return jsRender ? RENDERED : PLAIN;
};
