import { defineDocumentType } from "contentlayer/source-files";
import readingTime from "reading-time";

import { Image } from "../nested/Image";
import { SEO } from "../nested/SEO";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    excerpt: { type: "string", required: true },
    coverImage: { type: "nested", of: Image },
    externalUrl: { type: "string" },
    authors: {
      type: "list",
      of: { type: "string" },
    },
    seo: { type: "nested", of: SEO },
    draft: { type: "boolean", default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => {
        const slug = doc._raw.flattenedPath.replace("posts/", "");
        return slug;
      },
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
  },
}));
