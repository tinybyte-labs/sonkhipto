import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import type { Browser } from "puppeteer-core";

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

const getLinksFromCategory = async (browser: Browser, category: string) => {
  const url = new URL(`/${category}`, baseUrl);
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  await page.setViewport({ width: 1080, height: 1024 });

  const allLinks = await page.evaluate(() => {
    return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
  });

  const links: string[] = [];
  for (const link of allLinks) {
    if (link.startsWith(url.href)) {
      const url = new URL(link, baseUrl);
      if (!categories.includes(decodeURIComponent(url.pathname).slice(1))) {
        links.push(url.href);
      }
    }
  }

  await page.close();

  return { category, links, total: links.length };
};

export const getLatestArticleLinksFromPrathamAloEnglish: GetLatestArticleLinksFn =
  async (browser) => {
    const topLevelCategories = categories.filter((c) => !c.includes("/"));

    let links = [];
    for (const category of topLevelCategories) {
      const l = await getLinksFromCategory(browser, category);
      links.push(l);
    }
    return links.flatMap((link) => link.links);
  };

export const getArticleMetadataFromProthomAloEnglish: GetArticleMetadataFn =
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const metadata = await page.evaluate(() => {
      const title = document
        .querySelector(".story-content-wrapper > div > .story-head h1")
        ?.textContent?.trim();

      const pubDate = (
        document.querySelector(
          ".story-content-wrapper > div > .story-head .story-metadata-wrapper time",
        ) as HTMLTimeElement | null
      )?.dateTime;

      const thumbnailUrl = (
        document.querySelector(
          ".story-content-wrapper .story-content img",
        ) as HTMLImageElement | null
      )?.src;

      // const content = document
      //   .querySelector(".story-content-wrapper .story-content > div:nth-child(2)")
      //   ?.textContent?.trim();

      const content = (
        document.querySelector(
          "meta[name='description']",
        ) as HTMLMetaElement | null
      )?.content?.trim();

      return {
        title,
        thumbnailUrl,
        content,
        pubDate,
      };
    });

    return {
      title: metadata.title?.trim(),
      thumbnailUrl: metadata.thumbnailUrl,
      content: metadata.content?.trim(),
      publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
    };
  };
