import { newsPublishers } from "@/constants/publishers";
import { db, Prisma } from "@acme/db";
import { openai } from "@ai-sdk/openai";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 120;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const body = await req.json();
  const { urls, publisherId } = await z
    .object({
      urls: z.array(z.string().url()).min(1).max(10),
      publisherId: z.string(),
    })
    .parseAsync(body);

  const publisher = newsPublishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  try {
    const results = await Promise.allSettled(urls.map(scrapeFeedItem));
    const data = results
      .map((result) => {
        if (result.status === "fulfilled") {
          return {
            sourceUrl: result.value.sourceUrl,
            imageUrl: result.value.imageUrl,
            title: result.value.title.slice(0, 100),
            content: result.value.content.slice(0, 500),
            language: publisher.language,
            countryCode: publisher.countryCode,
            sourceName: publisher.name,
          } satisfies Prisma.PostCreateInput;
        }
        return null;
      })
      .filter((item) => !!item);

    await db.post.createMany({
      data,
      skipDuplicates: true,
    });

    return new NextResponse("Success");
  } catch (error) {
    console.error(`Failed to scrape posts`, error);
    return NextResponse.json(
      {
        message: `Failed to scrape posts`,
        error,
      },
      {
        status: 400,
      },
    );
  }
});

const scrapeFeedItem = async (
  sourceUrl: string,
): Promise<{
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
}> => {
  const exists = await db.post.findUnique({
    where: { sourceUrl },
  });

  if (exists) {
    throw new Error("Already scraped");
  }

  const res = await fetch(sourceUrl);
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
    sourceUrl,
    title,
    content: summary,
    imageUrl,
  };
};
