import { publishers } from "@acme/core/publishers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (req: NextRequest) => {
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
    const metadata = await publisher.getArticleMetadata(link);
    if (
      !metadata?.content?.trim() ||
      !metadata.title?.trim() ||
      !metadata.thumbnailUrl?.trim()
    ) {
      return NextResponse.json(
        {
          message: `Invalid metadata`,
          metadata,
        },
        {
          status: 400,
        },
      );
    }

    // const { category, content } = await summerizeDescription(metadata.content);

    return NextResponse.json({ metadata });
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
