import { getBrowser } from "@/lib/browser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import randomUserAgent from "random-useragent";

export const maxDuration = 300;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { url } = await z
    .object({
      url: z.string().url(),
    })
    .parseAsync(body);

  try {
    const browser = await getBrowser();
    console.log("Browser Opened");

    const userAgent = randomUserAgent.getRandom();
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.goto(url, { waitUntil: "networkidle2" });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const screenshot = await page.screenshot();
    console.log("Took screenshot");

    await browser.close();
    console.log("Browser Closed");

    return new NextResponse(screenshot, {
      headers: { "Content-Type": "image/jpeg; charset=UTF-8" },
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
