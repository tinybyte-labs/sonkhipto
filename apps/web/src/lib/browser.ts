import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const getBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });
};
