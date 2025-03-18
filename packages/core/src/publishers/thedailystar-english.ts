import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { getPage } from "../utils/server/helpers";

dayjs.extend(customParseFormat);

const baseUrl = "https://www.thedailystar.net";
const categories = [
  "news",
  "news/bangladesh",
  "news/investigative-stories",
  "news/asia",
  "news/world",
  "opinion",
  "health",
  "sports",
  "business",
  "entertainment",
  "culture",
  "life-living",
  "youth",
  "tech-startup",
  "lifestyle",
  "rising-stars",
  "showbiz",
  "my-dhaka",
  "satireday",
  "campus",
  "star-literature",
  "star-youth",
  "roundtables",
  "star-holiday",
  "environment",
  "environment",
  "nrb",
  "law-our-rights",
];

export const getLatestArticleLinksFromTheDailyStartEnglish: GetLatestArticleLinksFn =
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.href)
      .filter((link) => !!link) as string[];

    const links: string[] = [];

    for (const link of allLinks) {
      // Ignore any link which does not start with `baseUrl` or `/`.
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      const url = new URL(link, baseUrl);

      if (
        url.pathname.startsWith("/multimedia") ||
        url.pathname.startsWith("/campus") ||
        url.pathname.startsWith("/life-living")
      ) {
        continue;
      }

      if (
        !categories.includes(url.pathname.slice(1)) &&
        !links.includes(url.href)
      ) {
        const splitpath = url.pathname.slice(1).split("/");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (/^[a-z0-9-]+-\d+$/.test(splitpath[splitpath.length - 1]!)) {
          links.push(url.href);
        }
      }
    }
    return links;
  };

export const getArticleMetadataFromTheDailyStartEnglish: GetArticleMetadataFn =
  async (articleUrl) => {
    const url = new URL(articleUrl);
    if (url.origin !== baseUrl) {
      throw new Error("Invalid url");
    }

    const $ = await getPage(articleUrl);

    const title = $("#inner-wrap .container .detailed-content h1")
      .first()
      .text()
      .trim();
    const pubDate = $("#inner-wrap .byline-wrapper .date")
      .first()
      .text()
      .trim();

    const thumbnailUrl = $("meta[property='og:image']").attr()?.content;

    const paragraphArr: string[] = [];
    $(".article-section .clearfix p").each((_, el) => {
      paragraphArr.push($(el).text().trim());
    });
    const content = paragraphArr.join();

    return {
      thumbnailUrl,
      title,
      content,
      publishedAt: pubDate
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new Date(pubDate.trim().split("Last update on:")[0]!.trim())
        : null,
    };
  };
