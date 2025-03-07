import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "../types";
import { bengaliMonthMap, convertBengaliDigits } from "../utils/helpers";
import { getPage } from "../utils/server/helpers";

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
  async () => {
    const $ = await getPage(baseUrl);

    const allLinks = $("a")
      .toArray()
      .map((el) => $(el).attr()?.["href"])
      .filter((link) => !!link) as string[];

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
  articleUrl,
) => {
  const url = new URL(articleUrl);
  if (url.origin !== baseUrl) {
    throw new Error("Invalid url");
  }

  const $ = await getPage(articleUrl);

  const title = $(".container .single_news h1").text().trim();
  const pubDate = $(".container .single_news time").text()?.trim();
  const content = $("meta[name='description']").attr()?.["content"]?.trim();
  const thumbnailUrl = $("meta[property='og:image']").attr()?.["content"];

  return {
    thumbnailUrl,
    title,
    content,
    publishedAt: pubDate ? getDateFromBanglaDateTime(pubDate) : null,
  };
};

// banglaDate = প্রকাশ: ০১ মার্চ, ২০২৫ ০০:১৬
const getDateFromBanglaDateTime = (banglaDate: string) => {
  // Extract Bengali parts
  const parts: string[] = banglaDate.split(": ")[1]!.split(", ");
  const day: string = convertBengaliDigits(parts[0]!.split(" ")[0]!); // ২৮ -> 28
  const month: string | undefined = bengaliMonthMap[parts[0]!.split(" ")[1]!]; // ফেব্রুয়ারি -> February
  const year: string = convertBengaliDigits(parts[1]!.split(" ")[0]!); // ২০২৫ -> 2025
  const time: string = convertBengaliDigits(parts[1]!.split(" ")[1]!); // ০০:৩৫ -> 00:35

  if (!month) {
    throw new Error("Invalid month name in Bengali date string.");
  }

  // Construct final date string
  const formattedDate: string = `${day} ${month} ${year} ${time}`;

  // Parse with dayjs
  const parsedDate = dayjs(formattedDate, "D MMMM YYYY HH:mm");

  return parsedDate.toDate();
};
