import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const getBrowser = async (): Promise<Browser> => {
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
    executablePath:
      process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ??
      "/usr/bin/chromium-browser",
    args: chromeArgs,
    headless: true,
  });
};
