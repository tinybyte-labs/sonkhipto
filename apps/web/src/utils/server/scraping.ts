import { db } from "@acme/db";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import { z } from "zod";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const scrapePost = async (
  link: string,
): Promise<{
  title: string;
  content: string;
  imageUrl?: string;
  link: string;
}> => {
  const exists = await db.post.findUnique({
    where: { sourceUrl: link },
  });

  if (exists) {
    throw new Error("Already scraped");
  }

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar",
      )),
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(link, { waitUntil: "networkidle0" });

  const html = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  await browser.close();

  const $ = cheerio.load(html);

  let title: string | undefined = $("title").text().trim();
  if (!title) {
    title = $(`meta[property="og:title"]`).attr("content")?.trim();
  }

  if (!title) {
    throw new Error("Title not found!");
  }

  const metaOgImage = $(`meta[property="og:image"]`).attr("content");
  const metaTwitterImage = $(`meta[name="twitter:image"]`).attr("content");
  const imageUrl = metaOgImage ?? metaTwitterImage;

  $("head").remove();
  $("meta").remove();
  $("link").remove();
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  $("aside").remove();
  $("header").remove();
  $("footer").remove();
  $("nav").remove();
  const body = $.html().trim();

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    system:
      "Extract the main points from the following HTML blog post and generate a concise summary in the same language as the original text. Ensure the summary captures key ideas, main arguments, and important conclusions while maintaining clarity and readability. Remove unnecessary HTML tags or metadata and focus only on the main content.",
    schema: z.object({
      summary: z
        .string()
        .describe(
          "A concise summary extracted from the blog post, capturing key ideas and main arguments. Maximum 400 characters",
        ),
    }),
    messages: [{ role: "user", content: body }],
    maxTokens: 300,
  });

  const { summary } = result.object;

  return {
    link,
    title,
    content: summary,
    imageUrl,
  };
};
