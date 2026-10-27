const SPECIAL = /[.+?^${}()|[\]\\]/g;

export const toPathPattern = (glob: string): RegExp =>
  new RegExp(`^${glob.replace(SPECIAL, "\\$&").replaceAll("*", ".*")}$`);
