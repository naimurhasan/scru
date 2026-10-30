import { describe, expect, it } from "vitest";
import { toRecordColumns } from "./toRecordColumns";

describe("toRecordColumns", () => {
  it("lists every key once, in first-seen order", () => {
    expect(
      toRecordColumns([
        { title: "a", price: "1" },
        { title: "b", rating: "3" },
      ]),
    ).toEqual(["title", "price", "rating"]);
  });

  it("has no columns without records", () => {
    expect(toRecordColumns([])).toEqual([]);
  });
});
