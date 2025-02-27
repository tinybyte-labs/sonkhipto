import type { Publisher } from "@/types";
import {
  getArticleMetadataFromPrathamAloBangla,
  getLatestArticleLinksFromPrathamAloBangla,
} from "./prothomalo-bangla";
import {
  getLatestArticleLinksFromPrathamAloEnglish,
  getArticleMetadataFromProthomAloEnglish,
} from "./prothomalo-english";
import {
  getLatestArticleLinksFromIttefaqBangla,
  getMetadataFromIttefaqBangla,
} from "./ittefaq-bangla";
import {
  getLatestArticleLinksFromIttefaqEnglish,
  getMetadataFromIttefaqEnglish,
} from "./ittefaq-english";

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
  {
    id: "ittefaq-bangla",
    name: "দৈনিক ইত্তেফাক",
    websiteUrl: "https://www.ittefaq.com.bd/",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromIttefaqBangla,
    getArticleMetadata: getMetadataFromIttefaqBangla,
  },
  {
    id: "ittefaq-english",
    name: "The Daily Ittefaq",
    websiteUrl: "https://en.ittefaq.com.bd/",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromIttefaqEnglish,
    getArticleMetadata: getMetadataFromIttefaqEnglish,
  },
];
