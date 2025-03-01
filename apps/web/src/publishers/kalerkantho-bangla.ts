import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { bengaliMonthMap, convertBengaliDigits } from "@/utils/helpers";
import { autoPageScroll } from "@/utils/server/puppeteer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const baseUrl = "https://www.kalerkantho.com";

const categories = [
  "online/national",
  "online/country-news",
  "online/dhaka",
  "online/Politics",
  "online/Court",
  "online/campus-online",
  "online/world",
  "online/sport",
  "online/entertainment",
  "online/business",
  "online/stock-market",
  "online/Islamic-lifestylie",
  "online/lifestyle",
  "online/shuvosangho",
  "online/prescription",
  "online/jobs",
  "online/miscellaneous",
  "online/corporatecorner",
  "online/travel",
  "online/info-tech",
  "online/nrb",
  "online/opinion",
  "online/sahitya",
  "online/jokes",
  "online/social-media",
];

export const getLatestArticleLinksFromKalerKanthoBangla: GetLatestArticleLinksFn =
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

export const getMetadataFromKalerKanthoBangla: GetArticleMetadataFn = async (
  articleLink,
  browser,
) => {
  const page = await browser.newPage();
  const url = new URL(articleLink, baseUrl);
  await page.goto(url.href);

  const imgElement = await page.waitForSelector(".single_news .figure img");
  const thumbnailUrl = await imgElement?.evaluate((el) => el.src);

  const metadata = await page.evaluate(() => {
    const title = document
      .querySelector(".container .single_news h1")
      ?.textContent?.trim();
    const publishedDate = document
      .querySelector(".container .single_news time")
      ?.textContent?.trim();

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
      publishedDate,
    };
  });

  await page.close();

  return {
    thumbnailUrl,
    publishedAt: metadata.publishedDate
      ? getDateFromBanglaDateTime(metadata.publishedDate)
      : null,
    title: metadata.title?.trim(),
    content: metadata.content?.trim(),
  };
};

// banglaDate = প্রকাশ: ০১ মার্চ, ২০২৫ ০০:১৬
const getDateFromBanglaDateTime = (banglaDate: string) => {
  // Extract Bengali parts
  const parts: string[] = banglaDate.split(": ")[1].split(", ");
  const day: string = convertBengaliDigits(parts[0].split(" ")[0]); // ২৮ -> 28
  const month: string | undefined = bengaliMonthMap[parts[0].split(" ")[1]]; // ফেব্রুয়ারি -> February
  const year: string = convertBengaliDigits(parts[1].split(" ")[0]); // ২০২৫ -> 2025
  const time: string = convertBengaliDigits(parts[1].split(" ")[1]); // ০০:৩৫ -> 00:35

  if (!month) {
    throw new Error("Invalid month name in Bengali date string.");
  }

  // Construct final date string
  const formattedDate: string = `${day} ${month} ${year} ${time}`;

  // Parse with dayjs
  const parsedDate = dayjs(formattedDate, "D MMMM YYYY HH:mm");

  return parsedDate.toDate();
};
