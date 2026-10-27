export { mergeSearchPages } from "./google/mergeSearchPages.ts";
export { parseGoogleSearch } from "./google/parseGoogleSearch.ts";
export { parseGoogleSearchPages } from "./google/parseGoogleSearchPages.ts";
export type {
  GoogleSearchResult,
  KnowledgePanel,
  KnowledgePanelFact,
  OrganicResult,
  PeopleAlsoAskItem,
  RelatedSearch,
} from "./google/types.ts";
export { extractWithCss, type ExtractedValue } from "./page/extractWithCss.ts";
export {
  isValidExtractorRule,
  readExtractorRule,
  type ExtractorRule,
} from "./page/readExtractorRule.ts";
export { toMarkdown } from "./page/toMarkdown.ts";
export { toText } from "./page/toText.ts";
export { convertHtml, type TextOutput } from "./page/convertHtml.ts";
export { extractLinks } from "./page/extractLinks.ts";
export { extractPageType } from "./page/extractPageType.ts";
export {
  averageFill,
  measureFill,
  type FieldFill,
} from "./page/measureFill.ts";
export { simplifyHtml } from "./page/simplifyHtml.ts";
export type {
  ExtractedData,
  ExtractedRecord,
  ExtractorField,
  PageType,
  PageTypeRules,
} from "./page/extractorTypes.ts";
