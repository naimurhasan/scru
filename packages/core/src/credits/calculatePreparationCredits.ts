export const PREPARATION_CREDITS = 20;

export const calculatePreparationCredits = (
  pagesFetched: number,
  creditsPerPage: number,
): number => pagesFetched * creditsPerPage + PREPARATION_CREDITS;
