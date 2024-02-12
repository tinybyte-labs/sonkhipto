import { defineNestedType } from "contentlayer/source-files";

export const Image = defineNestedType(() => ({
  name: "ImageNested",
  fields: {
    url: { type: "string", required: true },
    alt: { type: "string", required: true },
    width: { type: "number", required: true },
    height: { type: "number", required: true },
  },
}));
