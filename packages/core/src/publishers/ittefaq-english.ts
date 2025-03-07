import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://en.ittefaq.com.bd";

const categories = [
  "bangladesh",
  "politics",
  "world",
  "sports",
  "entertainment",
  "climate-change",
  "art-and-culture",
  "lifestyle",
  "youth",
  "business",
  "tech",
  "viral-news",
  "opinion",
];
export const getLatestArticleLinksFromIttefaqEnglish: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.["href"])
      .filter((link) => !!link) as string[];

    let links: string[] = [];

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
          /^-?[\d.]+(?:e-?\d+)?$/.test(url.pathname.slice(1).split("/")[0]!)
        ) {
          links.push(url.href);
        }
      }
    }

    return links;
  };

export const getMetadataFromIttefaqEnglish: GetArticleMetadataFn = async (
  articleUrl,
) => {
  const url = new URL(articleUrl);
  if (url.origin !== baseUrl) {
    throw new Error("Invalid url");
  }

  const $ = await getPage(articleUrl);

  const title = $(".content_detail h1.title").text().trim();
  const pubDate = $(".content_detail .detail_holder .time .tts_time")
    .attr()
    ?.["content"]?.trim();
  const content = $("meta[name='description']").attr()?.["content"]?.trim();
  const thumbnailUrl = $("meta[property='og:image']").attr()?.["content"];

  return {
    thumbnailUrl,
    title,
    content,
    publishedAt: pubDate ? new Date(pubDate) : null,
  };
};
