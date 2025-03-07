import { autoPageScroll } from "../utils/server/puppeteer";
import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { bengaliMonthMap, convertBengaliDigits } from "../utils/helpers";

dayjs.extend(customParseFormat);

const baseUrl = "https://www.news24bd.tv";

export const getLatestArticleLinksFromNews24BDBangla: GetLatestArticleLinksFn =
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

    await page.close();

    const links: string[] = [];
    for (const link of allLinks) {
      // Ignore any link which does not start with `baseUrl` or `/`.
      if (!link.startsWith("/") && !link.startsWith(baseUrl)) {
        continue;
      }

      const url = new URL(link, baseUrl);
      if (url.pathname.startsWith("/details/") && !links.includes(url.href)) {
        links.push(url.href);
      }
    }

    return links;
  };

export const getArticleMetadataFromNews24BDBangla: GetArticleMetadataFn =
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const imgElement = await page.waitForSelector(".container .figure img");
    const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

    const metadata = await page.evaluate(() => {
      const title = document
        .querySelector(".container h1")
        ?.textContent?.trim();

      const articlePublishedTime = document
        .querySelector(".container time.text-black-50")
        ?.textContent?.trim();

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
        articlePublishedTime,
      };
    });

    await page.close();

    return {
      thumbnailUrl,
      title: metadata.title?.trim(),
      content: metadata.content?.trim(),
      publishedAt: metadata.articlePublishedTime
        ? getDateFromBanglaDateTime(metadata.articlePublishedTime)
        : null,
    };
  };

// banglaDate = আপডেট: শুক্রবার, ২৮ ফেব্রুয়ারি, ২০২৫, ২২:৩২
const getDateFromBanglaDateTime = (banglaDate: string) => {
  console.log(banglaDate);
  // Extract Bengali parts
  const parts: string[] = banglaDate.split(": ")[1]!.split(", ");
  const day: string = convertBengaliDigits(parts[1]!.split(" ")[0]!); // ২৮ -> 28
  const month: string | undefined = bengaliMonthMap[parts[1]!.split(" ")[1]!]; // ফেব্রুয়ারি -> February
  const year: string = convertBengaliDigits(parts[2]!); // ২০২৫ -> 2025
  const time: string = convertBengaliDigits(parts[3]!); // ০০:৩৫ -> 00:35

  if (!month) {
    throw new Error("Invalid month name in Bengali date string.");
  }

  // Construct final date string
  const formattedDate: string = `${day} ${month} ${year} ${time}`;

  // Parse with dayjs
  const parsedDate = dayjs(formattedDate, "D MMMM YYYY HH:mm");

  return parsedDate.toDate();
};
