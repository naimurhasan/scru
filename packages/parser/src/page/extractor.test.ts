import { describe, expect, it } from "vitest";
import { extractPageType } from "./extractPageType.ts";
import { averageFill, measureFill } from "./measureFill.ts";
import { simplifyHtml } from "./simplifyHtml.ts";

const listing = `<html><head><title>Shop</title><script>track()</script></head>
<body style="margin:0" onload="go()">
  <!-- promo -->
  <ol class="row">
    <li><article class="product_pod" data-x="1">
      <h3><a href="/p/1" title="Red chair">Red ch...</a></h3>
      <p class="price_color">£40.00</p>
      <p class="star-rating Three"></p>
    </article></li>
    <li><article class="product_pod">
      <h3><a href="/p/2" title="Blue table">Blue t...</a></h3>
      <p class="price_color">£90.00</p>
    </article></li>
  </ol>
</body></html>`;

describe("simplifyHtml", () => {
  it("keeps structure, classes and links and drops noise", () => {
    const simple = simplifyHtml(listing, 10_000);

    expect(simple).toContain('<article class="product_pod">');
    expect(simple).toContain('<a href="/p/1" title="Red chair">');
    expect(simple).not.toMatch(/track|promo|onload|style=|data-x|<title>/);
  });

  it("cuts to the size limit", () => {
    expect(simplifyHtml(listing, 40)).toHaveLength(40);
  });
});

describe("extractPageType", () => {
  const fields = [
    { name: "title", description: "", selector: "h3 a", attribute: "title" },
    { name: "link", description: "", selector: "h3 a", attribute: "href" },
    {
      name: "price",
      description: "",
      selector: ".price_color",
      attribute: null,
    },
    {
      name: "rating",
      description: "",
      selector: ".star-rating",
      attribute: "class",
    },
  ];

  it("reads one record per item on a listing page", () => {
    expect(
      extractPageType(listing, { itemSelector: "article.product_pod", fields }),
    ).toEqual([
      {
        title: "Red chair",
        link: "/p/1",
        price: "£40.00",
        rating: "star-rating Three",
      },
      { title: "Blue table", link: "/p/2", price: "£90.00", rating: null },
    ]);
  });

  it("reads one record from the whole page on a detail page", () => {
    expect(
      extractPageType(listing, {
        itemSelector: null,
        fields: [
          { name: "first", description: "", selector: "h3 a", attribute: null },
        ],
      }),
    ).toEqual({ first: "Red ch..." });
  });

  it("turns links and image sources into full addresses", () => {
    expect(
      extractPageType(
        listing,
        {
          itemSelector: "article.product_pod",
          fields: [fields[1], fields[0]].flatMap((field) => field ?? []),
        },
        "https://shop.example/catalogue/page-2.html",
      ),
    ).toEqual([
      { link: "https://shop.example/p/1", title: "Red chair" },
      { link: "https://shop.example/p/2", title: "Blue table" },
    ]);
  });

  it("reads the item itself when the selector is empty", () => {
    expect(
      extractPageType(listing, {
        itemSelector: ".price_color",
        fields: [
          { name: "price", description: "", selector: "", attribute: null },
        ],
      }),
    ).toEqual([{ price: "£40.00" }, { price: "£90.00" }]);
  });

  it("treats broken selectors as empty instead of failing", () => {
    expect(
      extractPageType(listing, {
        itemSelector: "article[",
        fields,
      }),
    ).toEqual([]);
    expect(
      extractPageType(listing, {
        itemSelector: null,
        fields: [
          { name: "x", description: "", selector: "h3[", attribute: null },
        ],
      }),
    ).toEqual({ x: null });
  });
});

describe("measureFill", () => {
  const fields = [
    { name: "title", description: "", selector: "", attribute: null },
    { name: "rating", description: "", selector: "", attribute: null },
  ];

  it("measures how often each field has a value across pages and items", () => {
    const fill = measureFill(
      [
        [
          { title: "a", rating: "3" },
          { title: "b", rating: null },
        ],
        { title: "c", rating: null },
      ],
      fields,
    );

    expect(fill.title).toBe(1);
    expect(fill.rating).toBeCloseTo(1 / 3);
    expect(averageFill(fill)).toBeCloseTo(2 / 3);
  });

  it("is zero when nothing was extracted", () => {
    expect(measureFill([[]], fields)).toEqual({ title: 0, rating: 0 });
    expect(averageFill({})).toBe(0);
  });
});
