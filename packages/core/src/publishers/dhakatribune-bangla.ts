import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { autoPageScroll } from "../utils/server/puppeteer";

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

export const getArticleMetadataFromDhakatribuneBangla: GetArticleMetadataFn =
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const imgElement = await page.waitForSelector(".featured_image span img");
    await new Promise((resolve) => setTimeout(resolve, 10));
    const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

    const metadata = await page.evaluate(() => {
      const title = (
        document.querySelector(
          ".content_detail h1.title",
        ) as HTMLHeadElement | null
      )?.textContent?.trim();

      const pubDate = (
        document.querySelector(
          ".content_detail_small_width .time span.published_time",
        ) as HTMLSpanElement | null
      )?.getAttribute("content");

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

    await page.close();

    return {
      thumbnailUrl,
      title: metadata.title?.trim(),
      content: metadata.content?.trim(),
      publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
    };
  };
