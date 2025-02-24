import { getBrowser } from "@/lib/browser";
import { publishers } from "@/publishers/publishers";
import { db, Prisma } from "@acme/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { links, publisherId } = await z
    .object({
      links: z.array(z.string().url()).min(1).max(10),
      publisherId: z.string(),
    })
    .parseAsync(body);

  const publisher = publishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  try {
    const browser = await getBrowser();

    const values: Prisma.PostCreateInput[] = [];
    for (const link of links) {
      const metadata = await publisher.getArticleMetadata(link, browser);
      console.log(metadata);
      if (metadata && metadata.title && metadata.content) {
        values.push({
          sourceUrl: link,
          imageUrl: metadata.thumbnailUrl,
          title: metadata.title,
          content: metadata.content,
          publishedAt: metadata.publishedAt ?? new Date(),
          language: publisher.language,
          countryCode: publisher.countryCode,
          sourceName: publisher.name,
        });
      }
    }

    await browser.close();

    if (values.length > 0) {
      await db.post.createMany({
        data: values,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: `Total ${values.length} posts created`,
    });
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
};
