import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { autoPageScroll } from "@/utils/server/puppeteer";

const baseUrl = "https://www.thedailystar.net";
const categories = [
  'news',
  'news/investigative-stories',
  'news/bangladesh',
  'news/investigative-stories',
  'news/asia',
  'news/world',
  'opinion',
  'opinion/rebuilding-bangladesh',
  'opinion/views',
  'opinion/quota-carnage',
  'opinion/16-days-activism',
  'opinion/budget-analysis-2024-25',
  'opinion/editorial',
  'opinion/geopolitical-insights',
  'opinion/focus',
  'opinion/readers-voice',
  'opinion/letters-the-editor',
  'opinion/interviews',
  'sports',
  'sports/cricket',
  'sports/afa-bkash-partnership',
  'sports/football',
  'sports/more-sports',
  'sports/sports-special',
  'business',
  'business/bangladesh-national-budget-fy2024-25',
  'business/banking',
  'business/business-special-events',
  'business/column',
  'business/economy',
  'business/export',
  'business/global-business',
  'business/global-economy',
  'business/infographics',
  'business/interview',
  'business/monetary-policy-january-june-24',
  'business/organisation-news',
  'business/port-and-shipping',
  'business/real-estate',
  'business/retail',
  'business/start-ups',
  'business/tax-and-customs',
  'business/telecom',
  'entertainment',
  'entertainment/tv-film',
  'entertainment/music',
  'entertainment/theatre-arts',
  'entertainment/satire',
  'entertainment/featured',
  'entertainment/heritage',
  'life-living',
  'life-living/eid-magazine-2024',
  'life-living/fashion-beauty',
  'life-living/food-recipes',
  'life-living/health-fitness',
  'life-living/lifehacks',
  'life-living/relationships-family',
  'life-living/travel',
  'youth',
  'youth/careers',
  'youth/education',
  'youth/young-icons',
  'tech-startup/apps',
  'tech-startup',
  'tech-startup/editors-pick',
  'tech-startup/gadgets',
  'tech-startup/gaming',
  'tech-startup/guides',
  'tech-startup/latest',
  'tech-startup/startups-0',
  'star-multimedia',
  'star-multimedia',
  'environment',
  'nrb',
  'law-our-rights',
  'brnad-stories'
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
        const isPost =
          categories.findIndex((category) => url.pathname.startsWith("/" + category + "/"),) !== -1;
        if (isPost) {
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
          "meta[property='article:published_time']",
        ) as HTMLMetaElement | null
      )?.content?.trim()

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
        ? new Date(metadata.pubDate)
        : null,
    };
  };
