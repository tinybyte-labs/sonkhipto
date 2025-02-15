import { newsPublishers } from "@/constants/publishers";
import { qstashClient } from "@/lib/qstash-client";
import { chunkArray } from "@/lib/utils";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import * as htmlparser2 from "htmlparser2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const res = await fetch(publisher.rssFeedUrl);
    const feedStr = await res.text();
    const feed = htmlparser2.parseFeed(feedStr);

    if (!feed) {
      throw new Error("Failed to parse feed");
    }

    console.log(`${publisher.url} - TOTAL ${feed.items.length} ITEMS`);

    const allUrls = feed.items
      .map((item) => item.link)
      .filter((link) => !!link) as string[];

    const chunks = chunkArray(allUrls, 10);

    await Promise.all(
      chunks.map((urls) =>
        qstashClient.publishJSON({
          url: `https://sonkhipto.com/api/tasks/scrape-posts`,
          body: {
            publisherId: publisher.id,
            urls,
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
