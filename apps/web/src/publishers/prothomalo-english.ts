import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { autoPageScroll } from "@/utils/server/puppeteer";

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
  async (browser) => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1200, height: 800 });
    await autoPageScroll(page);

    const allLinks = await page.evaluate(() => {
      return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
    });

    await page.close();

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
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const imgElement = await page.waitForSelector(
      ".story-content-wrapper .story-content .story-page-hero figure picture img.image",
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

    const metadata = await page.evaluate(() => {
      const title = document
        .querySelector(".story-content-wrapper > div > .story-head h1")
        ?.textContent?.trim();

      const pubDate = (
        document.querySelector(
          ".story-content-wrapper > div > .story-head .story-metadata-wrapper time",
        ) as HTMLTimeElement | null
      )?.dateTime;

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
        content,
        pubDate,
      };
    });

    return {
      thumbnailUrl,
      title: metadata.title?.trim(),
      content: metadata.content?.trim(),
      publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
    };
  };
