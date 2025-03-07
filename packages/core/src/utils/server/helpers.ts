import * as cheerio from "cheerio";

export const getPage = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html; charset=utf-8",
    },
    cache: "no-cache",
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const html = await res.text();

  return cheerio.load(html);
};
