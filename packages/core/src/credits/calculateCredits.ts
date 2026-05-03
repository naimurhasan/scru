export type RequestMode = "sync" | "async";

export type CreditInput = {
  pages: number;
  mode: RequestMode;
};

const GOOGLE_SEARCH = 3;
const EXTRA_PAGE = 2;
const SYNC_SURCHARGE = 2;

export const calculateCredits = ({ pages, mode }: CreditInput): number =>
  GOOGLE_SEARCH +
  EXTRA_PAGE * Math.max(pages - 1, 0) +
  (mode === "sync" ? SYNC_SURCHARGE : 0);
