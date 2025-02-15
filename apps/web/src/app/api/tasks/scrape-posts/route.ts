import { newsPublishers } from "@/constants/publishers";
import { scrapePost } from "@/utils/server/scraping";
import { db, Prisma } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 120;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const body = await req.json();
  const { items, publisherId } = await z
    .object({
      items: z
        .array(
          z.object({
            link: z.string().url(),
            pubDate: z.string().optional(),
          }),
        )
        .min(1)
        .max(10),
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
    const results = await Promise.allSettled(
      items.map((item) => scrapePost(item.link)),
    );
    const data = results
      .map((result) => {
        if (result.status === "fulfilled") {
          const item = items.find((item) => item.link === result.value.link);
          return {
            sourceUrl: result.value.link,
            imageUrl: result.value.imageUrl,
            title: result.value.title.slice(0, 100),
            content: result.value.content.slice(0, 500),
            language: publisher.language,
            countryCode: publisher.countryCode,
            sourceName: publisher.name,
            publishedAt: item?.pubDate ? new Date(item.pubDate) : new Date(),
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
