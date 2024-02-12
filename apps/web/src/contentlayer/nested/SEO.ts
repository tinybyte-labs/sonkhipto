import { defineNestedType } from "contentlayer/source-files";

export const SEO = defineNestedType(() => ({
  name: "SEO",
  fields: {
    title: { type: "string" },
    description: { type: "string" },
    creator: { type: "string" },
    keywords: { type: "string" },
    images: { type: "list", of: { type: "string" } },
  },
}));
