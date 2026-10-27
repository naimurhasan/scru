export type UrlGroup = {
  pattern: string;
  urls: string[];
};

const WILDCARD = "*";

const segmentsOf = (url: string) =>
  new URL(url).pathname.split("/").filter(Boolean);

const shapeOf = (url: string) =>
  segmentsOf(url).map((segment) => (/\d/.test(segment) ? WILDCARD : segment));

const toPattern = (shape: string[]) => `/${shape.join("/")}`;

const parentKey = (shape: string[]) =>
  `${shape.length}:${shape.slice(0, -1).join("/")}`;

export const groupUrlsByPattern = (urls: string[]): UrlGroup[] => {
  const shapes = urls.map((url) => ({ url, shape: shapeOf(url) }));
  const siblings = new Map<string, Set<string>>();
  for (const { shape } of shapes) {
    const key = parentKey(shape);
    siblings.set(key, (siblings.get(key) ?? new Set()).add(shape.at(-1) ?? ""));
  }
  const groups = new Map<string, string[]>();
  for (const { url, shape } of shapes) {
    const merged =
      shape.length > 0 && (siblings.get(parentKey(shape))?.size ?? 0) > 1
        ? [...shape.slice(0, -1), WILDCARD]
        : shape;
    const pattern = toPattern(merged);
    groups.set(pattern, [...(groups.get(pattern) ?? []), url]);
  }
  return [...groups.entries()]
    .map(([pattern, grouped]) => ({ pattern, urls: grouped }))
    .sort((a, b) => b.urls.length - a.urls.length);
};

export const matchesUrlPattern = (pattern: string, url: string): boolean => {
  const expected = pattern.split("/").filter(Boolean);
  const actual = segmentsOf(url);
  return (
    expected.length === actual.length &&
    expected.every(
      (segment, index) => segment === WILDCARD || segment === actual[index],
    )
  );
};
