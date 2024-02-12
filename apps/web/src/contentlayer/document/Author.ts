import { defineDocumentType } from "contentlayer/source-files";

export const Author = defineDocumentType(() => ({
  name: "Author",
  contentType: "data",
  filePathPattern: "authors/*.json",
  fields: {
    name: { type: "string", required: true },
    bio: { type: "string", required: true },
    avatar: { type: "string", required: true },
    handle: { type: "string", required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => {
        const slug = post._raw.flattenedPath
          .replace(post._raw.sourceFileDir, "")
          .slice(1);
        return slug;
      },
    },
  },
}));
