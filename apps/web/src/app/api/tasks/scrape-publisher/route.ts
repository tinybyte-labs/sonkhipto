import { newsPublishers } from "@/constants/publishers";
import { qstashClient } from "@/lib/qstash-client";
import { chunkArray } from "@/lib/utils";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Parser from "rss-parser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BASE_URL } from "@/constants";

const parser = new Parser();

export const maxDuration = 30;

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

  try {
    const feed = await parser.parseURL(publisher.rssFeedUrl);

    if (!feed) {
      throw new Error("Failed to parse feed");
    }

    console.log(`${publisher.url} - TOTAL ${feed.items.length} ITEMS`);

    const allUrls = feed.items
      .map((item) => ({ link: item.link, pubDate: item.pubDate }))
      .filter((item) => !!item.link);

    const chunks = chunkArray(allUrls, 10);

    await Promise.all(
      chunks.map((items) =>
        qstashClient.publishJSON({
          url: `${BASE_URL}/api/tasks/scrape-posts`,
          body: {
            publisherId: publisher.id,
            items,
          },
          retries: 0,
        }),
      ),
    );

    return new NextResponse("Success");
  } catch (error) {
    console.error(`Failed to scrape ${publisher.id}`, error);
    return NextResponse.json(
      {
        message: `Failed to scrape ${publisher.id}`,
        error,
      },
      {
        status: 400,
      },
    );
  }
});
