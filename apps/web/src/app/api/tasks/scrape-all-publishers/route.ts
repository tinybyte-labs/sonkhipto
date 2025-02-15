import { BASE_URL } from "@/constants";
import { newsPublishers } from "@/constants/publishers";
import { qstashClient } from "@/lib/qstash-client";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  const result = await Promise.all(
    newsPublishers.map((publisher) =>
      qstashClient.publishJSON({
        url: `${BASE_URL}/api/tasks/scrape-publisher`,
        body: {
          publisherId: publisher.id,
        },
        retries: 0,
      }),
    ),
  );

  return NextResponse.json({
    message: `${newsPublishers.length} publisher(s) queued for scraping...`,
    qstashMessageIds: result.map((res) => res.messageId),
  });
});
