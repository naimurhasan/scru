import { NodeHtmlMarkdown } from "node-html-markdown";

const converter = new NodeHtmlMarkdown({
  ignore: ["script", "style", "noscript", "template", "svg", "iframe", "head"],
});

export const toMarkdown = (html: string): string =>
  converter.translate(html).trim();
