export type TestedSite = {
  name: string;
  category: string;
  page: string;
  records: number;
  fields: string[];
};

export const TESTED_SITES: TestedSite[] = [
  {
    name: "Indeed",
    category: "Jobs",
    page: "Job search",
    records: 16,
    fields: ["job title", "link", "company", "snippet"],
  },
  {
    name: "Goodreads",
    category: "Books",
    page: "Book search",
    records: 17,
    fields: ["title", "author", "rating", "reviews", "cover", "year"],
  },
  {
    name: "Etsy",
    category: "Marketplace",
    page: "Product search",
    records: 66,
    fields: ["title", "price", "image"],
  },
  {
    name: "eBay",
    category: "E-commerce",
    page: "Product search",
    records: 62,
    fields: ["title", "link", "image", "price", "condition", "seller"],
  },
  {
    name: "BBC News",
    category: "News",
    page: "News front page",
    records: 45,
    fields: ["headline", "link", "image", "summary", "time", "section"],
  },
  {
    name: "Amazon",
    category: "E-commerce",
    page: "Product search",
    records: 16,
    fields: ["link", "image", "price", "rating", "reviews", "badge"],
  },
  {
    name: "Walmart",
    category: "Retail",
    page: "Category page",
    records: 37,
    fields: ["title", "link", "image", "price", "rating", "reviews"],
  },
  {
    name: "Hacker News",
    category: "News",
    page: "Front page",
    records: 30,
    fields: ["link"],
  },
];
