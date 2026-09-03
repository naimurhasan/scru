export type DocsLink = {
  href: string;
  label: string;
};

export type DocsGroup = {
  title: string;
  links: DocsLink[];
};

export const DOCS_SECTIONS: DocsGroup[] = [
  {
    title: "Get started",
    links: [
      { href: "/docs#create-a-key", label: "Create a key" },
      { href: "/docs#first-request", label: "First request" },
      { href: "/docs#read-the-response", label: "Read the response" },
    ],
  },
  {
    title: "API reference",
    links: [
      { href: "/docs/reference#authentication", label: "Authentication" },
      { href: "/docs/reference#google-search", label: "Google search" },
      { href: "/docs/reference#async-tasks", label: "Async tasks" },
      { href: "/docs/reference#webhooks", label: "Webhooks" },
      { href: "/docs/reference#errors", label: "Errors" },
      { href: "/docs/reference#limits", label: "Limits" },
    ],
  },
];
