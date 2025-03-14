import { publishers } from "@acme/core/publishers";
import { db } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { summerizeDescription } from "@/utils/ai-helper";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const body = await req.json();
  const { link, publisherId } = await z
    .object({
      link: z.string().url(),
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
    const exists = await db.post.findFirst({
      where: {
        sourceUrl: link,
      },
      select: { sourceUrl: true },
    });
    if (exists) {
      return NextResponse.json(
        { message: "Post already exist" },
        { status: 403 },
      );
    }

    const metadata = await publisher.getArticleMetadata(link);

    if (metadata?.title && metadata.content) {
      const { content, category } = await summerizeDescription(
        metadata.content,
      );

      await db.post.create({
        data: {
          sourceUrl: link,
          imageUrl: metadata.thumbnailUrl,
          title: metadata.title,
          content,
          publishedAt: metadata.publishedAt ?? new Date(),
          language: publisher.language,
          countryCode: publisher.countryCode,
          sourceName: publisher.name,
          category: category
            ? {
                connectOrCreate: {
                  where: { slug: category.slug },
                  create: {
                    slug: category.slug,
                    name: category.english,
                    nameBengali: category.bengali,
                  },
                },
              }
            : undefined,
        },
      });

      return NextResponse.json({ message: "Post created" });
    }

    return NextResponse.json(
      {
        message: "Invalid metadata",
        metadata,
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to scrape posts", error);
    return NextResponse.json(
      {
        message: "Failed to scrape posts",
        error,
      },
      {
        status: 400,
      },
    );
  }
});
