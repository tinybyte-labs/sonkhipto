import { publishers } from "@acme/core/publishers";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { publisherId } = await z
    .object({
      publisherId: z.string(),
    })
    .parseAsync(body);

  console.log({ publisherId });

  const publisher = publishers.find(
    (publisher) => publisher.id === publisherId,
  );

  if (!publisher) {
    return NextResponse.json("Publisher not found!", { status: 404 });
  }

  try {
    const links = await publisher.getLatestArticleLinks();

    console.log({ linkCount: links.length });

    return NextResponse.json({
      links,
      total: links.length,
    });
  } catch (error) {
    console.error(`Failed to scrape links`, error);
    return NextResponse.json(
      {
        message: `Failed to scrape links`,
        error,
      },
      {
        status: 400,
      },
    );
  }
};
