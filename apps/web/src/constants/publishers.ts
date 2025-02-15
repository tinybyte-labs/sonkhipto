import { NewsPublisher } from "@/types";

export const newsPublishers: NewsPublisher[] = [
  {
    id: "prothomalo-bangla",
    name: "প্রথম আলো",
    url: "https://www.prothomalo.com",
    rssFeedUrl:
      "https://prod-qt-images.s3.amazonaws.com/production/prothomalo-bangla/feed.xml",
    countryCode: "BD",
    language: "bn",
  },
  {
    id: "prothomalo-english",
    name: "Prothom Alo",
    url: "https://en.prothomalo.com/",
    rssFeedUrl:
      "https://prod-qt-images.s3.amazonaws.com/production/prothomalo-english/feed.xml",
    countryCode: "BD",
    language: "en",
  },
  // {
  //   id: "bd24live",
  //   name: "BD 24 Live",
  //   url: "https://www.bd24live.com",
  //   rssFeedUrl: "https://www.bd24live.com/feed",
  //   countryCode: "BD",
  //   language: "en",
  // },
  // {
  //   id: "ittefaq-bangla",
  //   name: "দৈনিক ইত্তেফাক",
  //   url: "https://www.ittefaq.com.bd/",
  //   rssFeedUrl: "https://www.ittefaq.com.bd/feed/",
  //   countryCode: "BD",
  //   language: "bn",
  // },
  // {
  //   id: "ittefaq-english",
  //   name: "The Daily Ittefaq",
  //   url: "https://en.ittefaq.com.bd/",
  //   rssFeedUrl: "https://en.ittefaq.com.bd/feed/",
  //   countryCode: "BD",
  //   language: "en",
  // },
  // {
  //   id: "kalerkantho-bangla",
  //   name: "কালের কণ্ঠ",
  //   url: "https://www.kalerkantho.com",
  //   rssFeedUrl: "https://www.kalerkantho.com/rss.xml",
  //   countryCode: "BD",
  //   language: "bn",
  // },
  // {
  //   id: "news24bd",
  //   name: "News24 TV",
  //   url: "https://www.news24bd.tv",
  //   rssFeedUrl: "https://www.news24bd.tv/rss.xml",
  //   countryCode: "BD",
  //   language: "bn",
  // },
  // {
  //   id: "thedailystar",
  //   name: "The Daily Star",
  //   url: "https://www.thedailystar.net",
  //   rssFeedUrl: "https://www.thedailystar.net/frontpage/rss.xml",
  //   countryCode: "BD",
  //   language: "en",
  // },
];
