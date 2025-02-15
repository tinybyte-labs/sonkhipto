import { db } from "@acme/db";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import { z } from "zod";

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

  const res = await fetch(link);
  if (res.status !== 200) {
    console.log(res.status, res.statusText);
    throw res.statusText;
  }
  const htmlText = await res.text();
  const $ = cheerio.load(htmlText);

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
      title: z.string().describe("Title of the blog post"),
      summary: z
        .string()
        .describe(
          "A concise summary extracted from the blog post, capturing key ideas and main arguments. Maximum 400 characters",
        ),
    }),
    messages: [{ role: "user", content: body }],
    maxTokens: 300,
  });

  const { summary, title } = result.object;

  return {
    link,
    title,
    content: summary,
    imageUrl,
  };
};
