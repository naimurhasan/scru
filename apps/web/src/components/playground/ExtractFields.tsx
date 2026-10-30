import { UrlField } from "@/components/playground/UrlField";
import type { ExtractRequest } from "@/lib/playground/types";

type ExtractFieldsProps = {
  request: ExtractRequest;
  onChange: (request: ExtractRequest) => void;
};

export function ExtractFields({ request, onChange }: ExtractFieldsProps) {
  return (
    <>
      <UrlField
        value={request.url}
        placeholder="https://books.toscrape.com/catalogue/category/books/mystery_3/index.html"
        onChange={(url) => onChange({ url })}
      />
      <p className="text-xs text-muted-foreground sm:col-span-full">
        Paste any page of any site. No selectors or schema needed: the fields
        are worked out for you the first time you use a site.
      </p>
    </>
  );
}
