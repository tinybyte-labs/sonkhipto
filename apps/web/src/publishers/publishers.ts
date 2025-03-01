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
  getLatestArticleLinksFromKalerKanthoBangla,
  getMetadataFromKalerKanthoBangla,
} from "./kalerkantho-bangla";
import {
  getLatestArticleLinksFromTheDailyStartEnglish,
  getArticleMetadataFromTheDailyStartEnglish,
} from "./thedailystar-english";
import {
  getLatestArticleLinksFromNews24BDBangla,
  getArticleMetadataFromNews24BDBangla,
} from "./news24bd-bangla";
import {
  getArticleMetadataFromBD24LiveEnglish,
  getLatestArticleLinksFromBD24LiveEnglish,
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
    getLatestArticleLinks: getLatestArticleLinksFromIttefaqEnglish,
    getArticleMetadata: getMetadataFromIttefaqEnglish,
  },
  {
    id: "kalerkantho-bangla",
    name: "কালের কণ্ঠ",
    websiteUrl: "https://www.kalerkantho.com",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromKalerKanthoBangla,
    getArticleMetadata: getMetadataFromKalerKanthoBangla,
  },
  // Has some issues
  // {
  //   id: "thedailystar-english",
  //   name: "The Daily Star",
  //   websiteUrl: "https://www.thedailystar.net",
  //   countryCode: "BD",
  //   language: "en",
  //   getLatestArticleLinks: getLatestArticleLinksFromTheDailyStartEnglish,
  //   getArticleMetadata: getArticleMetadataFromTheDailyStartEnglish,
  // },
  // Hard to match article url. Will take a look later
  // {
  //   id: "bd24live-english",
  //   name: "BD24Live",
  //   websiteUrl: "https://www.bd24live.com",
  //   countryCode: "BD",
  //   language: "en",
  //   getLatestArticleLinks: getLatestArticleLinksFromBD24LiveEnglish,
  //   getArticleMetadata: getArticleMetadataFromBD24LiveEnglish,
  // },
  {
    id: "news24bd-bangla",
    name: "News24BD",
    websiteUrl: "https://www.news24bd.tv",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromNews24BDBangla,
    getArticleMetadata: getArticleMetadataFromNews24BDBangla,
  },
];
