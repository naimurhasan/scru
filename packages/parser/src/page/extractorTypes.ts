export type ExtractorField = {
  name: string;
  description: string;
  selector: string;
  attribute: string | null;
};

export type PageTypeRules = {
  itemSelector: string | null;
  fields: ExtractorField[];
};

export type PageType = PageTypeRules & {
  name: string;
  pattern: string;
  fillRate: number;
};

export type ExtractedRecord = Record<string, string | null>;

export type ExtractedData = ExtractedRecord | ExtractedRecord[];
