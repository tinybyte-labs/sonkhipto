import { BASE_URL } from "@/constants";
import { qstashClient } from "@/lib/qstash-client";
import { publishers } from "@/publishers/publishers";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  await Promise.all(
    publishers.map((publisher) =>
      qstashClient.publishJSON({
        url: `${BASE_URL}/api/tasks/scrape-publisher`,
        body: {
          publisherId: publisher.id,
        },
        retries: 0,
      }),
    ),
  );

  return new NextResponse("Success");
});
