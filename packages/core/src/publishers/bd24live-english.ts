import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

const baseUrl = "https://www.bd24live.com";

export const getLatestArticleLinksFromBD24LiveEnglish: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.["href"])
      .filter((link) => !!link) as string[];

    const links: string[] = [];
    const regex = /^[a-z0-9]+(-[a-z0-9]+){3,}$/;
    for (const link of allLinks) {
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      const url = new URL(link, baseUrl);
      if (
        regex.test(url.pathname.slice(1).replace("/", "")) &&
        !links.includes(url.href)
      ) {
        links.push(url.href);
      }
    }

    return links;
  };

export const getArticleMetadataFromBD24LiveEnglish: GetArticleMetadataFn =
  async (articleUrl) => {
    const url = new URL(articleUrl);
    if (url.origin !== baseUrl) {
      throw new Error("Invalid url");
    }

    const $ = await getPage(articleUrl);

    const title = $(".header-standard.header-classic.single-header > h1")
      .text()
      .trim();
    const pubDate = $(".header-standard .post-box-meta-single time")
      .attr()
      ?.["datetime"]?.trim();
    const thumbnailUrl = $("meta[property='og:image']").attr()?.["content"];

    const paragraphArr: string[] = []
    $("#penci-post-entry-inner p").each((_, el) => {
      paragraphArr.push($(el).text().trim())
    })
    const content = paragraphArr.join()

    return {
      thumbnailUrl,
      title,
      content,
      publishedAt: pubDate ? new Date(pubDate.trim()) : null,
    };
  };