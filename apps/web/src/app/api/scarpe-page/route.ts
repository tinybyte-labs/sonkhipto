import { getBrowser } from "@/lib/browser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

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
