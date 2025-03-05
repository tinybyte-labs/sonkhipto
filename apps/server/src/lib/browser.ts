import puppeteer, { type Browser } from "puppeteer";

export const getBrowser = async (): Promise<Browser> => {
  return puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
    headless: true,
  });
};
