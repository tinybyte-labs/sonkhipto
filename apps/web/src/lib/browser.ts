import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const getBrowser = async (): Promise<Browser> => {
  // const executablePath = await chromium.executablePath(
  //   "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
  // );

  chromium.setGraphicsMode = false;
  const chromeArgs = [
    "--font-render-hinting=none", // Improves font-rendering quality and spacing
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-animations",
    "--disable-background-timer-throttling",
    "--disable-restore-session-state",
    "--disable-web-security", // Only if necessary, be cautious with security implications
    "--single-process", // Be cautious as this can affect stability in some environments
  ];

  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromeArgs,
    headless: true,
  });
};
