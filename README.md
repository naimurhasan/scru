# scru

Scraping API: Fetch, Extract, Crawl, Batch and Google search.

## Start

```sh
docker compose up -d && pnpm dev
```

API on port 4000, dashboard on port 3000.

## Tested

Extract learned each site from one pasted page, with no hand-written selectors.

| Site        | Category    | Page                              | Records | Fields                                        |
| ----------- | ----------- | --------------------------------- | ------- | --------------------------------------------- |
| Indeed      | Jobs        | `/jobs?q=python+developer`        | 16      | job title, link, company, snippet             |
| Goodreads   | Books       | `/search?q=dune`                  | 17      | title, author, rating, reviews, cover, year   |
| Etsy        | Marketplace | `/search?q=wireless+mouse`        | 66      | title, price, image                           |
| eBay        | E-commerce  | `/sch/i.html?_nkw=wireless+mouse` | 62      | title, link, image, price, condition, seller  |
| BBC News    | News        | `/news`                           | 45      | headline, link, image, summary, time, section |
| Amazon      | E-commerce  | `/s?k=wireless+mouse`             | 16      | link, image, price, rating, reviews, badge    |
| Walmart     | Retail      | `/cp/electronics/3944`            | 37      | title, link, image, price, rating, reviews    |
| Hacker News | News        | `/`                               | 30      | link                                          |

Not passing yet: GitHub Trending, IMDb, Zillow, Booking, Craigslist, Walmart search.
