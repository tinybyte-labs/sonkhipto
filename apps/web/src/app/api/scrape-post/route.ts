import { newsPublishers } from "@/constants/publishers";
import { scrapePost } from "@/utils/server/scraping";
import { db } from "@acme/db";
import chromium from "chrome-aws-lambda";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { z } from "zod";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { postUrl, publisherId, pubDate } = await z
    .object({
      pubDate: z.string().optional(),
      postUrl: z.string().url(),
      publisherId: z.string(),
    })
    .parseAsync(body);

  const publisher = newsPublishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const data = await scrapePost(postUrl, browser);

  await browser.close();

  const post = await db.post.create({
    data: {
      sourceUrl: data.link,
      imageUrl: data.imageUrl,
      title: data.title.slice(0, 100),
      content: data.content.slice(0, 500),
      language: publisher.language,
      countryCode: publisher.countryCode,
      sourceName: publisher.name,
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
    },
  });

  return NextResponse.json(post);
};
