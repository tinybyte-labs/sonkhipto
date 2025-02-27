import { Page } from "puppeteer-core";

export const autoPageScroll = async (
  page: Page,
  scrollDistance = 800,
  maxScrolls = 50,
) => {
  await page.evaluate(
    async (maxScrolls, scrollDistance) => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        let scrolls = 0;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          totalHeight += scrollDistance;
          window.scrollTo({
            top: totalHeight,
          });
          scrolls++;

          if (
            totalHeight >= scrollHeight - window.innerHeight ||
            scrolls >= maxScrolls
          ) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    },
    maxScrolls,
    scrollDistance,
  );
};
