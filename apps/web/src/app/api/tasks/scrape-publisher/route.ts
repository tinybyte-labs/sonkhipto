import { allCategories, BASE_URL } from "@/constants";
import { qstashClient } from "@/lib/qstash-client";
import { publishers } from "@acme/core/publishers";
import { db } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    await Promise.all(
      uniqueLinks.map((link) =>
        qstashClient.publishJSON({
          url: `${BASE_URL}/api/tasks/scrape-article`,
          body: {
            publisherId: publisher.id,
            link,
          },
          retries: 0,
        }),
      ),
    );

    // for category generation
    for (let i = 0; i < allCategories.length; i++) {
      const category = allCategories[i];
      const exist = await db.category.findFirst({ where: { name: category } })
      if (!exist) {
        await db.category.create({ data: { name: category } })
      }
    }

    return NextResponse.json({
      message: `Total ${uniqueLinks.length} links sent to scrape`,
    });
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
