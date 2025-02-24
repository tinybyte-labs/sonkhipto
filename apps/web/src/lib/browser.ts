import puppeteer, { type Browser } from "puppeteer-core";
import chrome from "chrome-aws-lambda";

export const getBrowser = async (): Promise<Browser> => {
  // const aws = process.env.AWS_LAMDA_FUNCTION_VERSION
  // const executablePath = await chromium.executablePath(
  //   "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
  // );
  return puppeteer.launch({
    executablePath: await chrome.executablePath,
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chrome.defaultViewport,
    headless: true,
  });
};
