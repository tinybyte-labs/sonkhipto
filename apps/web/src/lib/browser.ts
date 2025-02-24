import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const getBrowser = async (): Promise<Browser> => {
  const executablePath = await chromium.executablePath(
    "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
  );
  return puppeteer.launch({
    executablePath,
    args: chromium.args,
    headless: "shell",
    defaultViewport: chromium.defaultViewport,
  });
};
