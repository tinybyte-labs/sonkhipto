import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://en.prothomalo.com";

const categories = [
  // bangladesh
  "bangladesh",
  "bangladesh/politics",
  "bangladesh/accident",
  "bangladesh/good-day-bangladesh",
  "bangladesh/crime-and-law",
  "bangladesh/government",
  "bangladesh/city",
  "bangladesh/local-news",
  "bangladesh/parliament",
  "bangladesh/bangladesh-in-world-media",
  "bangladesh/roundtable",

  // international
  "international",
  "international/asia",
  "international/europe",
  "international/americas",
  "international/middle-east",
  "international/india",
  "international/china",
  "international/africa",
  "international/australia",
  "international/south-asia",

  // sports
  "sports",
  "sports/cricket",
  "sports/football",
  "sports/local-sports",

  // business,
  "business",
  "business/local",
  "business/global",
  "topic/national-budget-2024-25",

  // opinion
  "opinion",
  "opinion/editorial",
  "opinion/interview",
  "opinion/op-ed",

  // youth
  "youth",
  "youth/education",
  "youth/employment",

  // entertainment
  "entertainment",
  "entertainment/music",
  "entertainment/movies",
  "entertainment/television",
  "entertainment/ott",

  // lifestyle
  "lifestyle",
  "lifestyle/fashion",
  "lifestyle/health",
  "lifestyle/beauty",
  "lifestyle/travel",

  // environment
  "environment",
  "environment/climate-change",
  "environment/pollution",

  // science-technology
  "science-technology",
  "science-technology/gadgets",
  "science-technology/social-media",
  "science-technology/it",
  "science-technology/science",

  // corporate
  "corporate",
  "corporate/local",
  "corporate/global",
];

export const getLatestArticleLinksFromPrathamAloEnglish: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.["href"])
      .filter((link) => !!link) as string[];

    const links: string[] = [];

    for (const link of allLinks) {
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      const url = new URL(link, baseUrl);
      if (
        !categories.includes(url.pathname.slice(1)) &&
        !links.includes(url.href)
      ) {
        const isPost =
          categories.findIndex((category) =>
            url.pathname.startsWith("/" + category + "/"),
          ) !== -1;

        if (isPost) {
          links.push(url.href);
        }
      }
    }

    return links;
  };

export const getArticleMetadataFromProthomAloEnglish: GetArticleMetadataFn =
  async (articleUrl) => {
    const url = new URL(articleUrl);
    if (url.origin !== baseUrl) {
      throw new Error("Invalid url");
    }

    const $ = await getPage(articleUrl);

    const title = $(".story-content-wrapper .story-head h1").text().trim();
    const pubDate = $(
      ".story-content-wrapper .story-head .story-metadata-wrapper time",
    ).attr()?.["datetime"];

    const paragraphArr: string[] = [];
    $(".story-element .story-element-text").each((_, el) => {
      paragraphArr.push($(el).text().trim());
    });
    const content = paragraphArr.join();

    const thumbnailUrl = $("meta[property='og:image']").attr()?.["content"];

    return {
      thumbnailUrl,
      title,
      content,
      publishedAt: pubDate ? new Date(pubDate) : null,
    };
  };
