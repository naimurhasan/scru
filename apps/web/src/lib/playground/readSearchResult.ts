import { z } from "zod";

const searchResultSchema = z.object({
  organicResults: z.array(
    z.object({
      position: z.number(),
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
    }),
  ),
  peopleAlsoAsk: z.array(z.object({ question: z.string() })),
  relatedSearches: z.array(z.object({ query: z.string() })),
  knowledgePanel: z
    .object({
      title: z.string(),
      subtitle: z.string().nullable(),
      description: z.string().nullable(),
      facts: z.array(z.object({ label: z.string(), value: z.string() })),
    })
    .nullable(),
});

const successBodySchema = z.object({
  success: z.literal(true),
  result: searchResultSchema,
});

export type SearchResult = z.infer<typeof searchResultSchema>;
export type OrganicResult = SearchResult["organicResults"][number];
export type KnowledgePanel = NonNullable<SearchResult["knowledgePanel"]>;

export const readSearchResult = (body: unknown): SearchResult | null => {
  const parsed = successBodySchema.safeParse(body);
  return parsed.success ? parsed.data.result : null;
};
