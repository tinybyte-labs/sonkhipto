import { parse } from "node-html-parser";

export const getPageMetadata = async (link: string) => {
  const res = await fetch(link);
  const html = await res.text();
  const $ = parse(html);
  const language = $.querySelector("html")?.getAttribute("lang")?.trim();
  const content = $.querySelector('meta[property="og:description"]')
    ?.getAttribute("content")
    ?.trim();
  const authorName = $.querySelector('meta[name="author"]')
    ?.getAttribute("content")
    ?.trim();
  const keywords = $.querySelector('meta[name="keywords"]')
    ?.getAttribute("content")
    ?.trim()
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const title = $.querySelector('meta[property="og:title"]')
    ?.getAttribute("content")
    ?.trim();
  const imageUrl = $.querySelector('meta[property="og:image"]')
    ?.getAttribute("content")
    ?.trim();

  return {
    language,
    title,
    content,
    imageUrl,
    authorName,
    keywords,
  };
};
