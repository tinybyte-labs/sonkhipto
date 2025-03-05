import puppeteer, { type Browser } from "puppeteer";

export const getBrowser = async (): Promise<Browser> => {
  const chromeArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-software-rasterizer",
    "--window-size=1280,800",
    "--user-agent=GutenbergScraper/1.0 (+https://github.com/wadewegner/doappplat-puppeteer-sample) Chromium/120.0.0.0",
  ];

  return puppeteer.launch({
    headless: true,
    args: chromeArgs,
    defaultViewport: {
      width: 1280,
      height: 800,
    },
  });
};
