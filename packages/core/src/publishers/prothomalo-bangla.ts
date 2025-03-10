import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://www.prothomalo.com";

const categories: string[] = [
  // politics
  "politics",

  // bngladesh
  "bangladesh",
  "bangladesh/capital",
  "bangladesh/district",
  "bangladesh/coronavirus",
  "bangladesh/crime",
  "bangladesh/environment",
  "bangladesh/environment",

  // world
  "world",
  "world/india",
  "world/pakistan",
  "world/china",
  "world/middle-east",
  "world/usa",
  "world/asia",
  "world/europe",
  "world/africa",
  "world/south-america",

  // business
  "business",
  "business/market",
  "business/bank",
  "business/industry",
  "business/economics",
  "business/world-business",
  "business/analysis",
  "business/personal-finance",
  "business/উদ্যোক্তা",
  "business/corporate",
  "business/corporate",

  // opinion
  "opinion",
  "opinion/editorial",
  "opinion/column",
  "opinion/interview",
  "opinion/memoir",
  "opinion/reaction",
  "opinion/letter",

  // entertainment
  "entertainment",
  "entertainment/tv",
  "entertainment/ott",
  "entertainment/dhallywood",
  "entertainment/tollywood",
  "entertainment/bollywood",
  "entertainment/hollywood",
  "entertainment/world-cinema",
  "entertainment/song",
  "entertainment/drama",
  "entertainment/entertainment-interview",

  // lifestyle
  "lifestyle",
  "lifestyle/travel",
  "lifestyle/relation",
  "lifestyle/health",
  "lifestyle/horoscope",
  "lifestyle/fashion",
  "lifestyle/style",
  "lifestyle/beauty",
  "lifestyle/interior",
  "lifestyle/recipe",
  "lifestyle/shopping",

  // chakri
  "chakri",
  "chakri/chakri-news",
  "chakri/employment",
  "chakri/chakri-suggestion",
  "chakri/chakri-interview",

  // Sports
  "sports",
  "sports/cricket",
  "sports/football",
  "sports/tennis",
  "sports/other-sports",
  "sports/sports-interview",

  // technology
  "technology",
  "technology/gadget",
  "technology/advice",
  "technology/science",
  "technology/automobiles",
  "technology/cyberworld",
  "technology/freelancing",
  "technology/artificial-intelligence",

  // education
  "education",
  "education/admission",
  "education/examination",
  "education/scholarship",
  "education/study",
  "education/higher-education",
  "education/campus",

  // religion
  "religion",
  "religion/islam",
  "religion/hindu",
  "religion/buddhist",
  "religion/christian",

  // onnalo
  "onnoalo",
  "onnoalo/poem",
  "onnoalo/stories",
  "onnoalo/treatise",
  "onnoalo/books",
  "onnoalo/arts",
  "onnoalo/interview",
  "onnoalo/travel",
  "onnoalo/others",
  "onnoalo/translation",
  "onnoalo/prose",
  "onnoalo/children",
];

export const getLatestArticleLinksFromPrathamAloBangla: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.["href"])
      .filter((link) => !!link) as string[];

    const links: string[] = [];

    for (const link of allLinks) {
      // Ignore any link which does not start with `baseUrl` or `/`.
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      // Some link in a page could start with `/`. creating url this way addes the `baseUrl` infront.
      const url = new URL(link, baseUrl);
      if (
        !categories.includes(url.pathname.slice(1)) &&
        !links.includes(url.href)
      ) {
        // We can make sure a url is a post by checking if the pathname is like `/category/s2asdlk43fasdf`
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

export const getArticleMetadataFromPrathamAloBangla: GetArticleMetadataFn =
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
