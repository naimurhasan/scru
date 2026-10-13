export type LinkDescription = {
  site: string;
  breadcrumb: string;
};

const SEPARATOR = " › ";

export const describeLink = (link: string): LinkDescription => {
  if (!URL.canParse(link)) return { site: link, breadcrumb: link };
  const url = new URL(link);
  const segments = url.pathname
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
  return {
    site: url.hostname.replace(/^www\./, ""),
    breadcrumb: [url.origin, ...segments].join(SEPARATOR),
  };
};
