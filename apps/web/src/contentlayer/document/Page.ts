import { defineDocumentType } from "contentlayer/source-files";
import { SEO } from "../nested/SEO";

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: "pages/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string" },
    seo: { type: "nested", of: SEO },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => {
        const slug = doc._raw.flattenedPath.replace("pages/", "");
        return slug;
      },
    },
  },
}));
