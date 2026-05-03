export type OrganicResult = {
  position: number;
  title: string;
  link: string;
  snippet: string;
  page: number;
};

export type PeopleAlsoAskItem = {
  question: string;
};

export type RelatedSearch = {
  query: string;
};

export type KnowledgePanelFact = {
  label: string;
  value: string;
};

export type KnowledgePanel = {
  title: string;
  subtitle: string | null;
  description: string | null;
  facts: KnowledgePanelFact[];
};

export type GoogleSearchResult = {
  organicResults: OrganicResult[];
  peopleAlsoAsk: PeopleAlsoAskItem[];
  relatedSearches: RelatedSearch[];
  knowledgePanel: KnowledgePanel | null;
};
