import { BASE_URL } from "@acme/core/constants";
import { publishers } from "@acme/core/publishers";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { NextResponse } from "next/server";

import { qstashClient } from "@/lib/qstash-client";

export const POST = verifySignatureAppRouter(async () => {
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

  return NextResponse.json({
    message: `Total ${publishers.length} publishers sent to scrape`,
  });
});
