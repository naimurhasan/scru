"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FETCH_OUTPUTS,
  SHOWCASE_PRODUCTS,
  type FetchFormat,
  type ProductKey,
} from "@/lib/site/showcase";
import { BatchGrid } from "./BatchGrid";
import { FormatPicker } from "./FormatPicker";
import { MockPage } from "./MockPage";
import { OutputCard } from "./OutputCard";
import { ShowcaseTabs } from "./ShowcaseTabs";

export function ProductShowcase() {
  const [active, setActive] = useState<ProductKey>("fetch");
  const [format, setFormat] = useState<FetchFormat>("md");
  const product =
    SHOWCASE_PRODUCTS.find(({ key }) => key === active) ?? SHOWCASE_PRODUCTS[0];
  const output = active === "fetch" ? FETCH_OUTPUTS[format] : product.output;

  return (
    <div className="rounded-3xl bg-stone-950 p-4 text-stone-100 sm:p-8">
      <ShowcaseTabs
        products={SHOWCASE_PRODUCTS}
        active={active}
        onSelect={setActive}
      />
      <div
        key={active}
        className="relative mt-6 max-w-3xl pb-48 animate-in fade-in sm:pb-28"
      >
        <div className="max-w-xl">
          {active === "batch" ? (
            <BatchGrid page={product.page} />
          ) : (
            <MockPage page={product.page} product={active} />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 sm:left-auto sm:right-0 sm:w-[26rem]">
          <OutputCard {...output} />
          {active === "fetch" && (
            <FormatPicker active={format} onSelect={setFormat} />
          )}
        </div>
      </div>
      <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-300">
        {product.blurb}
        <Link
          href={product.href}
          className="font-medium text-stone-50 hover:underline"
        >
          Explore {product.label} →
        </Link>
      </p>
    </div>
  );
}
