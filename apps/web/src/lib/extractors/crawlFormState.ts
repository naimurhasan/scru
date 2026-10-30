export type CrawlFormState = {
  error: string | null;
  started: boolean;
};

export const INITIAL_CRAWL_FORM_STATE: CrawlFormState = {
  error: null,
  started: false,
};
