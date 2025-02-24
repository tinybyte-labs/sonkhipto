import { BASE_URL } from "@/constants";
import { qstashClient } from "@/lib/qstash-client";
import { chunkArray } from "@/lib/utils";
import { publishers } from "@/publishers/publishers";
import { db } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const body = await req.json();
  const { publisherId } = await z
    .object({ publisherId: z.string() })
    .parseAsync(body);

  const publisher = publishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  try {
    const links = await publisher.getLatestArticleLinks();

    const existingLinks = await db.post.findMany({
      where: { sourceUrl: { in: links } },
      select: { sourceUrl: true },
    });
    const existingLinksSet = new Set(
      existingLinks.map((item) => item.sourceUrl),
    );

    const uniqueLinks = links.filter((link) => !existingLinksSet.has(link));

    console.log(`${publisher.id} - TOTAL ${uniqueLinks.length} ITEMS`);

    const chunks = chunkArray(uniqueLinks, 10);

    await Promise.all(
      chunks.map((items) =>
        qstashClient.publishJSON({
          url: `${BASE_URL}/api/tasks/scrape-articles`,
          body: {
            publisherId: publisher.id,
            links: items,
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
