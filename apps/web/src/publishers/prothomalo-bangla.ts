import type { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import type { Browser } from "puppeteer-core";

const baseUrl = "https://www.prothomalo.com";

const categories: string[] = [
  // politics
  "politics",

  // bngladesh
  "bangladesh",
  "bangladesh/capital",
  "bangladesh/district",
  "bangladesh/coronavirus",
  "bangladesh/crime",
  "bangladesh/environment",
  "bangladesh/environment",

  // world
  "world",
  "world/india",
  "world/pakistan",
  "world/china",
  "world/middle-east",
  "world/usa",
  "world/asia",
  "world/europe",
  "world/africa",
  "world/south-america",

  // business
  "business",
  "business/market",
  "business/bank",
  "business/industry",
  "business/economics",
  "business/world-business",
  "business/analysis",
  "business/personal-finance",
  "business/উদ্যোক্তা",
  "business/corporate",
  "business/corporate",

  // opinion
  "opinion",
  "opinion/editorial",
  "opinion/column",
  "opinion/interview",
  "opinion/memoir",
  "opinion/reaction",
  "opinion/letter",

  // entertainment
  "entertainment",
  "entertainment/tv",
  "entertainment/ott",
  "entertainment/dhallywood",
  "entertainment/tollywood",
  "entertainment/bollywood",
  "entertainment/hollywood",
  "entertainment/world-cinema",
  "entertainment/song",
  "entertainment/drama",
  "entertainment/entertainment-interview",

  // lifestyle
  "lifestyle",
  "lifestyle/travel",
  "lifestyle/relation",
  "lifestyle/health",
  "lifestyle/horoscope",
  "lifestyle/fashion",
  "lifestyle/style",
  "lifestyle/beauty",
  "lifestyle/interior",
  "lifestyle/recipe",
  "lifestyle/shopping",

  // chakri
  "chakri",
  "chakri/chakri-news",
  "chakri/employment",
  "chakri/chakri-suggestion",
  "chakri/chakri-interview",

  // Sports
  "sports",
  "sports/cricket",
  "sports/football",
  "sports/tennis",
  "sports/other-sports",
  "sports/sports-interview",

  // technology
  "technology",
  "technology/gadget",
  "technology/advice",
  "technology/science",
  "technology/automobiles",
  "technology/cyberworld",
  "technology/freelancing",
  "technology/artificial-intelligence",

  // education
  "education",
  "education/admission",
  "education/examination",
  "education/scholarship",
  "education/study",
  "education/higher-education",
  "education/campus",

  // religion
  "religion",
  "religion/islam",
  "religion/hindu",
  "religion/buddhist",
  "religion/christian",

  // onnalo
  "onnoalo",
  "onnoalo/poem",
  "onnoalo/stories",
  "onnoalo/treatise",
  "onnoalo/books",
  "onnoalo/arts",
  "onnoalo/interview",
  "onnoalo/travel",
  "onnoalo/others",
  "onnoalo/translation",
  "onnoalo/prose",
  "onnoalo/children",
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

export const getLatestArticleLinksFromPrathamAloBangla: GetLatestArticleLinksFn =
  async (browser) => {
    const topLevelCategories = categories.filter((c) => !c.includes("/"));

    let links = [];
    for (const category of topLevelCategories) {
      const l = await getLinksFromCategory(browser, category);
      links.push(l);
    }
    return links.flatMap((link) => link.links);
  };

export const getArticleMetadataFromPrathamAloBangla: GetArticleMetadataFn =
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
