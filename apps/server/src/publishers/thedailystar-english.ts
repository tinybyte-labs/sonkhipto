import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { autoPageScroll } from "../utils/puppeteer";

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
  async (browser) => {
    const page = await browser.newPage();
    // Make sure we waitUntil `documentloaded`
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1200, height: 800 });

    // Auto scrolls down so the contents at the bottom could load before we pull all the links.
    await autoPageScroll(page);

    // Get all the links from the page
    const allLinks = await page.evaluate(() => {
      return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
    });

    const links: string[] = [];
    for (const link of allLinks) {
      // Ignore any link which does not start with `baseUrl` or `/`.
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      const url = new URL(link, baseUrl);
      if (
        !categories.includes(url.pathname.slice(1)) &&
        !links.includes(url.href)
      ) {
        const splitpath = url.pathname.slice(1).split("/");
        if (/^[a-z0-9-]+-\d+$/.test(splitpath[splitpath.length - 1]!)) {
          links.push(url.href);
        }
      }
    }
    await page.close();
    return links;
  };

export const getArticleMetadataFromTheDailyStartEnglish: GetArticleMetadataFn =
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    // On prothomalo images loads after the document gets loaded. So We need to wait for the image load too.
    const imgElement = await page.waitForSelector(".section-media img");

    // Some extra delay to make sure the src get's applied correctly.
    await new Promise((resolve) => setTimeout(resolve, 10));
    const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

    const metadata = await page.evaluate(() => {
      const title = document
        .querySelector("#inner-wrap .container .detailed-content h1")
        ?.textContent?.trim();

      const pubDate = (
        document.querySelector(
          "#inner-wrap .byline-wrapper .date",
        ) as HTMLTimeElement | null
      )?.textContent;

      // For now we can get the description from page metadata. Will use the main article content and ai to generate summery soon.
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
      publishedAt: metadata.pubDate
        ? new Date(metadata.pubDate.trim().split("Last update on:")[0]!.trim())
        : null,
    };
  };
