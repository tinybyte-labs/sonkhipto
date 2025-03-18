import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://www.ittefaq.com.bd";
const categories = [
  "national",
  "politics",
  "country",
  "capital",
  "sports",
  "business",
  "opinion",
  "entertainment",
  "law-and-court",
  "education",
  "lifestyle",
  "news",
  "environment",
  "world-news",
  "tech",
  "jobs",
  "projonmo",
  "probash",
  "campus",
  "literature",
  "religion",
  "editorial",
];

export const getLatestArticleLinksFromIttefaqBangla: GetLatestArticleLinksFn =
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
        if (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          /^-?[\d.]+(?:e-?\d+)?$/.test(url.pathname.slice(1).split("/")[0]!)
        ) {
          links.push(url.href);
        }
      }
    }

    return links;
  };

export const getMetadataFromIttefaqBangla: GetArticleMetadataFn = async (
  articleUrl,
) => {
  const url = new URL(articleUrl);
  if (url.origin !== baseUrl) {
    throw new Error("Invalid url");
  }

  const $ = await getPage(articleUrl);

  const title = $(".content_detail h1.title").first().text().trim();
  const pubDate = $(".content_detail .detail_holder .time .tts_time")
    .first()
    .attr()
    ?.content?.trim();
  const thumbnailUrl = $("meta[property='og:image']").attr()?.content;

  const paragraphArr: string[] = [];
  $(".jw_article_body").each((_, el) => {
    paragraphArr.push($(el).text().trim());
  });

  const content = paragraphArr.join("\n").trim();

  return {
    thumbnailUrl,
    title,
    content,
    publishedAt: pubDate ? new Date(pubDate) : null,
  };
};
