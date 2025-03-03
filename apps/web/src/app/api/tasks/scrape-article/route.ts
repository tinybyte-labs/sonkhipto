import { getBrowser } from "@/lib/browser";
import { publishers } from "@/publishers/publishers";
import { db } from "@acme/db";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

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

    const browser = await getBrowser();
    const metadata = await publisher.getArticleMetadata(link, browser);
    await browser.close();

    if (metadata && metadata.title && metadata.content) {
      await db.post.create({
        data: {
          sourceUrl: link,
          imageUrl: metadata.thumbnailUrl,
          title: metadata.title,
          content: metadata.content,
          publishedAt: metadata.publishedAt ?? new Date(),
          language: publisher.language,
          countryCode: publisher.countryCode,
          sourceName: publisher.name,
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
