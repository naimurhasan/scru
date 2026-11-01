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

const siblingKey = (shape: string[], index: number) =>
  `${shape.length}:${index}:${shape.with(index, "").join("/")}`;

const countBy = <Item>(items: Item[], keyOf: (item: Item) => string) => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

export const groupUrlsByPattern = (urls: string[]): UrlGroup[] => {
  const shapes = urls.map((url) => ({ url, shape: shapeOf(url) }));
  const repeats = countBy(shapes, ({ shape }) => toPattern(shape));
  const siblings = new Map<string, Set<string>>();
  for (const { shape } of shapes) {
    shape.forEach((segment, index) => {
      const key = siblingKey(shape, index);
      siblings.set(key, (siblings.get(key) ?? new Set()).add(segment));
    });
  }
  const groups = new Map<string, string[]>();
  for (const { url, shape } of shapes) {
    const merged =
      (repeats.get(toPattern(shape)) ?? 0) > 1
        ? shape
        : shape.map((segment, index) =>
            (siblings.get(siblingKey(shape, index))?.size ?? 0) > 1
              ? WILDCARD
              : segment,
          );
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
