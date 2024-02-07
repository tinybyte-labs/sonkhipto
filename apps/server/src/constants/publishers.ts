import { NewsPublisher } from "../types/news-publisher";

export const newsPublishers: NewsPublisher[] = [
  {
    name: "প্রথম আলো",
    url: "https://www.prothomalo.com",
    rssFeedUrl:
      "https://prod-qt-images.s3.amazonaws.com/production/prothomalo-bangla/feed.xml",
    countryCode: "BD",
    language: "bn",
  },
  {
    name: "Prothom Alo",
    url: "https://en.prothomalo.com/",
    rssFeedUrl:
      "https://prod-qt-images.s3.amazonaws.com/production/prothomalo-english/feed.xml",
    countryCode: "BD",
    language: "en",
  },
];
