import { getBrowser } from "@/lib/browser";
import { publishers } from "@/publishers/publishers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { publisherId } = await z
    .object({
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
    console.log("Browser launched");

    const links = await publisher.getLatestArticleLinks(browser);

    console.log(links);

    await browser.close();
    console.log("Browser closed");

    return NextResponse.json({
      links,
      total: links.length,
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
