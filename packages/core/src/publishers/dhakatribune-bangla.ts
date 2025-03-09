import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://bangla.dhakatribune.com";

const categories = [
  "bangladesh",
  "politics",
  "international",
  "economy",
  "opinion",
  "sport",
  "entertainment",
  "feature",
  "technology",
  "others",
  "archive",
];

export const getLatestArticleLinksFromDhakatribuneBangla: GetLatestArticleLinksFn =
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

export const getArticleMetadataFromDhakatribuneBangla: GetArticleMetadataFn =
  async (articleUrl) => {
    const url = new URL(articleUrl);
    if (url.origin !== baseUrl) {
      throw new Error("Invalid url");
    }

    const $ = await getPage(articleUrl);

    const title = $(".content_detail h1.title").text().trim();
    const pubDate = $(".content_detail .time span.published_time")
      .attr()
      ?.["content"]?.trim();

    const thumbnailUrl = $("meta[property='og:image']").attr()?.["content"];

    const paragraphArr: string[] = []
    $(".jw_article_body p").each((_, el) => {
      paragraphArr.push($(el).text().trim())
    })
    const content = paragraphArr.join()

    return {
      thumbnailUrl,
      title,
      content,
      publishedAt: pubDate ? new Date(pubDate) : null,
    };
  };
