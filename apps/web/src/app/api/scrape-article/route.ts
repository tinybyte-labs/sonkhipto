import { getBrowser } from "@/lib/browser";
import { publishers } from "@/publishers/publishers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

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
    const browser = await getBrowser();

    const metadata = await publisher.getArticleMetadata(link, browser);

    await browser.close();

    return NextResponse.json(metadata);
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
