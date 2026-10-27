const BOOLEAN_FIELDS = new Set(["jsRender", "blockResources", "premiumProxy"]);
const NUMBER_FIELDS = new Set(["wait"]);
const JSON_FIELDS = new Set(["cssExtractor", "jsInstructions"]);

const parseBoolean = (value: string): unknown => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

const parseNumber = (value: string): unknown =>
  value.trim() !== "" && Number.isFinite(Number(value)) ? Number(value) : value;

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const readValue = (field: string, value: string): unknown => {
  if (BOOLEAN_FIELDS.has(field)) return parseBoolean(value);
  if (NUMBER_FIELDS.has(field)) return parseNumber(value);
  if (JSON_FIELDS.has(field)) return parseJson(value);
  return value;
};

export const readFetchQuery = (
  query: Record<string, string | undefined>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(query).flatMap(([field, value]) =>
      value === undefined ? [] : [[field, readValue(field, value)]],
    ),
  );
