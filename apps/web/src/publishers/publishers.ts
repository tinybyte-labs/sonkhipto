import type { Publisher } from "@/types";
import {
  getArticleMetadataFromPrathamAloBangla,
  getLatestArticleLinksFromPrathamAloBangla,
} from "./prothomalo-bangla";
import {
  getLatestArticleLinksFromPrathamAloEnglish,
  getArticleMetadataFromProthomAloEnglish,
} from "./prothomalo-english";

export const publishers: Publisher[] = [
  {
    id: "prothomalo-bangla",
    name: "প্রথম আলো",
    websiteUrl: "https://www.prothomalo.com",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromPrathamAloBangla,
    getArticleMetadata: getArticleMetadataFromPrathamAloBangla,
  },
  {
    id: "prothomalo-english",
    name: "Prothomalo",
    websiteUrl: "https://en.prothomalo.com",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromPrathamAloEnglish,
    getArticleMetadata: getArticleMetadataFromProthomAloEnglish,
  },
];
