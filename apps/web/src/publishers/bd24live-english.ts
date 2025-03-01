import { autoPageScroll } from "@/utils/server/puppeteer";
import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";

const baseUrl = "https://www.bd24live.com";

export const getLatestArticleLinksFromBD24LiveEnglish: GetLatestArticleLinksFn =
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
  async (articleUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    // On prothomalo images loads after the document gets loaded. So We need to wait for the image load too.
    const imgElement = await page.waitForSelector(".post-image > a > img");
    // Some extra delay to make sure the src get's applied correctly.
    await new Promise((resolve) => setTimeout(resolve, 10));

    const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

    const metadata = await page.evaluate(() => {
      const title = document
        .querySelector(".header-standard.header-classic.single-header > h1")
        ?.textContent?.trim();

      const pubDate = (
        document.querySelector(
          ".header-standard .post-box-meta-single time",
        ) as HTMLTimeElement | null
      )?.dateTime;

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

    await page.close();

    return {
      thumbnailUrl,
      title: metadata.title?.trim(),
      content: metadata.content?.trim(),
      publishedAt: metadata.pubDate ? new Date(metadata.pubDate.trim()) : null,
    };
  };
