import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { autoPageScroll } from "@/utils/server/puppeteer";
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
  async (browser) => {
    const page = await browser.newPage();
    console.log("Page Created");
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    console.log("Page Loaded");
    await page.setViewport({ width: 1200, height: 800 });
    await autoPageScroll(page);
    console.log("Page Scrolled");

    const allLinks = await page.evaluate(() => {
      return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
    });
    console.log("Got All Links");
    console.log(allLinks);

    await page.close();
    console.log("Page Closed");

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
        if (/^-?[\d.]+(?:e-?\d+)?$/.test(url.pathname.slice(1).split("/")[0])) {
          links.push(url.href);
        }
      }
    }

    return links;
  };

export const getMetadataFromIttefaqEnglish: GetArticleMetadataFn = async (
  articleLink,
  browser,
) => {
  const page = await browser.newPage();
  const url = new URL(articleLink, baseUrl);
  await page.goto(url.href);
  const imgElement = await page.waitForSelector(
    ".content_detail .detail_holder .featured_image img",
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  //   Do not use srcset
  const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

  const metadata = await page.evaluate(() => {
    const title = document
      // Use simpler selector
      .querySelector(".content_detail h1.title")
      ?.textContent?.trim();

    const pubDate = (
      document.querySelector(
        ".content_detail .detail_holder .time .tts_time",
      ) as HTMLTimeElement | null
    )
      ?.getAttribute("content")
      ?.trim();

    //      const content = (
    //       document.querySelector('#widget_322 .content_detail_outer .content_detail_content_outer article > div',
    //     ) as HTMLMetaElement | null
    //   )?.textContent?.trim();

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
    title: metadata.title?.trim(),
    thumbnailUrl,
    content: metadata.content?.trim(),
    publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
  };
};
