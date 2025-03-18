import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://www.dhakatribune.com";

const categories = [
  "bangladesh",
  "bangladesh/dhaka",
  "bangladesh/education",
  "bangladesh/election",
  "bangladesh/foreign-affairs",
  "bangladesh/nation",
  "bangladesh/politics",
  "bangladesh/government-affairs",
  "bangladesh/crime",
  "bangladesh/laws-rights",

  "business",
  "business/economy",
  "business/banks",
  "business/commerce",
  "business/stock",
  "business/real-estate",

  "world",
  "world/asia",
  "world/south-asia",
  "world/africa",
  "world/middle-east",
  "world/europe",
  "world/north-america",

  "sport",
  "sport/cricket",
  "sport/football",
  "sport/tennis",
  "sport/athletics",
  "sport/formula-one",
  "sport/other-sports",

  "opinion",
  "opinion/op-ed",
  "opinion/editorial",
  "opinion/longform",

  "feature",

  "showtime",

  "financial-markets",

  "others",

  "tribune-z",

  "magazine",

  "science-technology-environment",

  "around-the-web",

  "seminars-and-interviews",

  "brief",

  "photo-gallery",
];

export const getLatestArticleLinksFromDhakatribuneEnglish: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.href)
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

export const getArticleMetadataFromDhakatribuneEnglish: GetArticleMetadataFn =
  async (articleUrl) => {
    const url = new URL(articleUrl);
    if (url.origin !== baseUrl) {
      throw new Error("Invalid url");
    }

    const $ = await getPage(articleUrl);

    const title = $(".content_detail h1.title").first().text().trim();
    const pubDate = $(".content_detail .time span.published_time")
      .first()
      .attr()
      ?.content?.trim();

    const thumbnailUrl = $("meta[property='og:image']").attr()?.content;

    const paragraphArr: string[] = [];
    $(".jw_article_body p").each((_, el) => {
      paragraphArr.push($(el).text().trim());
    });
    const content = paragraphArr.join();

    return {
      thumbnailUrl,
      title,
      content,
      publishedAt: pubDate ? new Date(pubDate) : null,
    };
  };
