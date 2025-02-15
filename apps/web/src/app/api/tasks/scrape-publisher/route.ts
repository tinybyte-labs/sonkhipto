import { chunkArray } from "@/lib/utils";
import { NewsPublisher } from "@/types";
import { db, Prisma } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import * as htmlparser2 from "htmlparser2";
import { parse } from "node-html-parser";
import { z } from "zod";
import { newsPublishers } from "@/constants/publishers";

const getPageMetadata = async (link: string) => {
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

const scrapeFeedItem = async (item: htmlparser2.DomUtils.FeedItem) => {
  if (typeof item.link !== "string") {
    console.log("Invalid Link", item.link);
    throw new Error("Invalid Link");
  }

  const sourceUrl = item.link;

  const exists = await db.post.findUnique({
    where: { sourceUrl },
  });

  if (exists) {
    throw new Error("Already scraped");
  }

  const pageMetadata = await getPageMetadata(sourceUrl);
  const title = pageMetadata?.title || item.title;
  const content = pageMetadata?.content || item.description;
  const imageUrl = pageMetadata?.imageUrl ?? item.media?.[0]?.url;

  if (!title || title.length >= 100) {
    throw new Error("Invalid title");
  }

  if (!content || content.length > 500 || content.length < 50) {
    throw new Error("Invalid content");
  }

  const newsItem = {
    title,
    content,
    sourceUrl,
    imageUrl,
  };

  return newsItem;
};

const scrapePublisherFeed = async (publisher: NewsPublisher) => {
  const res = await fetch(publisher.rssFeedUrl);
  const feedStr = await res.text();
  const feed = htmlparser2.parseFeed(feedStr);

  if (!feed) {
    throw new Error("Failed to parse feed");
  }

  console.log(`${publisher.url} - TOTAL ${feed.items.length} ITEMS`);

  const posts: Prisma.PostCreateInput[] = [];

  const chunks = chunkArray(feed.items, 30);

  for (let i = 0; i < chunks.length; i++) {
    try {
      const chunk = chunks[i];
      const results = await Promise.allSettled(chunk.map(scrapeFeedItem));
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          posts.push({
            ...result.value,
            language: publisher.language,
            countryCode: publisher.countryCode,
            sourceName: publisher.name,
          });
        }
      });
    } catch (error: any) {}
  }
  console.log(`${publisher.url} - TOTAL ${posts.length} UNIQUE POSTS`);

  return posts;
};

export const maxDuration = 120;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const body = await req.json();
  const { publisherId } = await z
    .object({ publisherId: z.string() })
    .parseAsync(body);
  const publisher = newsPublishers.find(
    (publisher) => publisher.id === publisherId,
  );
  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  const data = await scrapePublisherFeed(publisher);

  const post = await db.post.createMany({
    data,
    skipDuplicates: true,
  });

  return new Response(
    `Publisher "${publisher.name}" scrapped successfully. Scrapped ${post.count} posts.`,
  );
});
