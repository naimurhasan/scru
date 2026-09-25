export type GoogleSession = {
  id: string;
  cookie: string;
  headers: Record<string, string>;
  createdAt: number;
};
