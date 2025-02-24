import { Publisher } from "@/types";
import {
  getArticleMetadataFromPrathamAloBangla,
  getLatestArticleLinksFromPrathamAloBangla,
} from "./prothomalo-bangla";

export const publishers: Publisher[] = [
  {
    id: "prothomalo-bangla",
    name: "প্রথম আলো",
    websiteUrl: "https://www.prothomalo.com",
    getLatestArticleLinks: getLatestArticleLinksFromPrathamAloBangla,
    getArticleMetadata: getArticleMetadataFromPrathamAloBangla,
  },
];
