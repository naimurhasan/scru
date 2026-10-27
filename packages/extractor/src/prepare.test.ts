import { describe, expect, it, vi } from "vitest";
import type { CompleteJson } from "./createOpenRouterClient.ts";
import { readPageTypeAnswer } from "./pageTypeAnswer.ts";
import { prepareExtractor, type SamplePage } from "./prepareExtractor.ts";

const product = (id: number, title: string, price: string): SamplePage => ({
  url: `https://shop.example/catalogue/${title.toLowerCase()}_${id}/index.html`,
  html: `<div class="product_main"><h1>${title}</h1><p class="price_color">${price}</p><p class="instock">In stock</p></div>`,
});

const samples = [
  product(1, "Chair", "£40.00"),
  product(2, "Table", "£90.00"),
  product(3, "Lamp", "£15.00"),
  product(4, "Desk", "£120.00"),
  { url: "https://shop.example/", html: "<h1>Home</h1>" },
];

const goodAnswer = {
  name: "Product Detail",
  itemSelector: null,
  fields: [
    {
      name: "title",
      description: "Product name",
      selector: ".product_main h1",
      attribute: null,
    },
    {
      name: "price",
      description: "Price",
      selector: ".price_color",
      attribute: null,
    },
  ],
};

describe("readPageTypeAnswer", () => {
  it("normalizes names, empty selectors and repeated fields", () => {
    expect(
      readPageTypeAnswer({
        name: "Product Detail",
        itemSelector: "",
        fields: [
          { name: "Unit Price", selector: ".p", attribute: "" },
          { name: "unit price", selector: ".q", attribute: null },
        ],
      }),
    ).toEqual({
      name: "product_detail",
      itemSelector: null,
      fields: [
        {
          name: "unit_price",
          description: "",
          selector: ".p",
          attribute: null,
        },
      ],
    });
  });

  it("refuses answers in the wrong shape", () => {
    expect(readPageTypeAnswer({ fields: [] })).toBeNull();
    expect(readPageTypeAnswer("not json")).toBeNull();
  });
});

describe("prepareExtractor", () => {
  it("asks once per page type when the first answer holds up on unseen pages", async () => {
    const completeJson = vi.fn<CompleteJson>(async () => goodAnswer);
    const prepared = await prepareExtractor(completeJson, samples);

    expect(prepared.modelCalls).toBe(1);
    expect(prepared.pageTypes).toEqual([
      {
        name: "product_detail",
        pattern: "/catalogue/*/index.html",
        itemSelector: null,
        fields: goodAnswer.fields,
        fillRate: 1,
      },
    ]);
  });

  it("shows the model only two sample pages", async () => {
    const completeJson = vi.fn<CompleteJson>(async () => goodAnswer);
    await prepareExtractor(completeJson, samples);
    const prompt = completeJson.mock.calls[0]?.[0][1]?.content ?? "";

    expect(prompt).toContain("Chair");
    expect(prompt).toContain("Table");
    expect(prompt).not.toContain("Lamp");
  });

  it("asks for a repair when fields come back empty, and keeps the better answer", async () => {
    const brittle = {
      ...goodAnswer,
      fields: [
        goodAnswer.fields[0],
        {
          name: "price",
          description: "",
          selector: "#price-1",
          attribute: null,
        },
      ],
    };
    const completeJson = vi
      .fn<CompleteJson>()
      .mockResolvedValueOnce(brittle)
      .mockResolvedValueOnce(goodAnswer);
    const prepared = await prepareExtractor(completeJson, samples);
    const repairPrompt = completeJson.mock.calls[1]?.[0][1]?.content ?? "";

    expect(prepared.modelCalls).toBe(2);
    expect(repairPrompt).toContain("came back empty: price");
    expect(prepared.pageTypes[0]?.fields).toEqual(goodAnswer.fields);
  });

  it("drops fields that never fill instead of saving them", async () => {
    const withGhost = {
      ...goodAnswer,
      fields: [
        ...goodAnswer.fields,
        { name: "isbn", description: "", selector: ".isbn", attribute: null },
      ],
    };
    const completeJson = vi.fn<CompleteJson>(async () => withGhost);
    const prepared = await prepareExtractor(completeJson, samples);

    expect(prepared.pageTypes[0]?.fields.map(({ name }) => name)).toEqual([
      "title",
      "price",
    ]);
  });

  it("drops a field that only repeats another field's values", async () => {
    const withEcho = {
      ...goodAnswer,
      fields: [
        ...goodAnswer.fields,
        {
          name: "stock",
          description: "",
          selector: ".instock",
          attribute: null,
        },
        {
          name: "reviews",
          description: "",
          selector: ".instock",
          attribute: null,
        },
      ],
    };
    const completeJson = vi.fn<CompleteJson>(async () => withEcho);
    const prepared = await prepareExtractor(completeJson, samples);

    expect(prepared.pageTypes[0]?.fields.map(({ name }) => name)).toEqual([
      "title",
      "price",
      "stock",
    ]);
  });

  it("skips a page type when the model answer is unusable", async () => {
    const completeJson = vi.fn<CompleteJson>(async () => {
      throw new Error("The model answered 500");
    });
    const prepared = await prepareExtractor(completeJson, samples);

    expect(prepared).toEqual({ pageTypes: [], modelCalls: 1 });
  });
});
