import type { Publisher } from "../types";
import {
  getArticleMetadataFromBD24LiveEnglish,
  getLatestArticleLinksFromBD24LiveEnglish,
} from "./bd24live-english";
import {
  getArticleMetadataFromDhakatribuneBangla,
  getLatestArticleLinksFromDhakatribuneBangla,
} from "./dhakatribune-bangla";
import {
  getArticleMetadataFromDhakatribuneEnglish,
  getLatestArticleLinksFromDhakatribuneEnglish,
} from "./dhakatribune-english";
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
  getArticleMetadataFromPrathamAloBangla,
  getLatestArticleLinksFromPrathamAloBangla,
} from "./prothomalo-bangla";
import {
  getArticleMetadataFromProthomAloEnglish,
  getLatestArticleLinksFromPrathamAloEnglish,
} from "./prothomalo-english";
import {
  getArticleMetadataFromTheDailyStartEnglish,
  getLatestArticleLinksFromTheDailyStartEnglish,
} from "./thedailystar-english";

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
    websiteUrl: "https://www.ittefaq.com.bd",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromIttefaqBangla,
    getArticleMetadata: getMetadataFromIttefaqBangla,
  },
  {
    id: "ittefaq-english",
    name: "The Daily Ittefaq",
    websiteUrl: "https://en.ittefaq.com.bd",
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
  {
    id: "thedailystar-english",
    name: "The Daily Star",
    websiteUrl: "https://www.thedailystar.net",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromTheDailyStartEnglish,
    getArticleMetadata: getArticleMetadataFromTheDailyStartEnglish,
  },
  {
    id: "bd24live-english",
    name: "BD24Live",
    websiteUrl: "https://www.bd24live.com",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromBD24LiveEnglish,
    getArticleMetadata: getArticleMetadataFromBD24LiveEnglish,
  },
  {
    id: "dhakatribune-english",
    name: "Dhaka Tribune",
    websiteUrl: "https://www.dhakatribune.com",
    countryCode: "BD",
    language: "en",
    getLatestArticleLinks: getLatestArticleLinksFromDhakatribuneEnglish,
    getArticleMetadata: getArticleMetadataFromDhakatribuneEnglish,
  },
  {
    id: "dhakatribune-bangla",
    name: "Dhaka Tribune Bangla",
    websiteUrl: "https://bangla.dhakatribune.com",
    countryCode: "BD",
    language: "bn",
    getLatestArticleLinks: getLatestArticleLinksFromDhakatribuneBangla,
    getArticleMetadata: getArticleMetadataFromDhakatribuneBangla,
  },
];
