import * as cheerio from "cheerio";

export const getPage = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw res.statusText;
  }

  const html = await res.text();
  console.log(html);

  return cheerio.load(html);
};
