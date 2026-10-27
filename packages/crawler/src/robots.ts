export type RobotsRule = {
  allow: boolean;
  pattern: string;
};

const SPECIAL = /[.+?^${}()|[\]\\]/g;

const readLine = (line: string): [string, string] | null => {
  const [field, ...rest] = line.replace(/#.*/, "").split(":");
  const value = rest.join(":").trim();
  return field === undefined ? null : [field.trim().toLowerCase(), value];
};

export const parseRobots = (text: string, agent = "*"): RobotsRule[] => {
  const rules: RobotsRule[] = [];
  let agents: string[] = [];
  let readingAgents = false;
  for (const line of text.split(/\r?\n/)) {
    const entry = readLine(line);
    if (!entry || entry[0] === "") continue;
    const [field, value] = entry;
    if (field === "user-agent") {
      agents = readingAgents
        ? [...agents, value.toLowerCase()]
        : [value.toLowerCase()];
      readingAgents = true;
      continue;
    }
    readingAgents = false;
    if (!agents.includes(agent.toLowerCase())) continue;
    if ((field === "allow" || field === "disallow") && value !== "")
      rules.push({ allow: field === "allow", pattern: value });
  }
  return rules;
};

const matches = (pattern: string, path: string) => {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .replace(SPECIAL, "\\$&")
    .replaceAll("*", ".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path);
};

export const isAllowedByRobots = (
  rules: RobotsRule[],
  path: string,
): boolean => {
  const matching = rules.filter((rule) => matches(rule.pattern, path));
  if (matching.length === 0) return true;
  const longest = Math.max(...matching.map((rule) => rule.pattern.length));
  return matching.some((rule) => rule.allow && rule.pattern.length === longest);
};
