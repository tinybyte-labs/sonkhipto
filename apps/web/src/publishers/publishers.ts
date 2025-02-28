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
import {
  getLatestArticleLinksFromKalkerKontho,
  getMetadataFromKalerKontho,
} from "./kalerkontho-bangla";
import {
  getLatestArticleLinksFromDailyStart,
  getArticleMetadataFromDailyStart,
} from "./daily-star";
import {
  getLatestArticleLinksFromNews24live,
  getArticleMetadataFromNews24live

} from "./news24";
import {
  getArticleMetadataFromBd24live,
  getLatestArticleLinksFromBd24live
} from "./bd24live-english";

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
    getLatestArticleLinks: getLatestArticleLinksFromKalkerKontho,
    getArticleMetadata: getMetadataFromKalerKontho,
  },
  {
    id: "thedailystar",
    name: "The Daily Star",
    websiteUrl: "https://www.thedailystar.net",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromDailyStart,
    getArticleMetadata: getArticleMetadataFromDailyStart,
  },
  {
    id: "bd24live",
    name: "BD 24 Live",
    websiteUrl: "https://www.bd24live.com",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromBd24live,
    getArticleMetadata: getArticleMetadataFromBd24live,
  },
  {
    id: "news24bd",
    name: "News24 TV",
    websiteUrl: "https://www.news24bd.tv",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromNews24live,
    getArticleMetadata: getArticleMetadataFromNews24live,
  }
];
