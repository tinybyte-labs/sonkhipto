import { autoPageScroll } from "@/utils/server/puppeteer";
import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";

const baseUrl = 'https://www.news24bd.tv'

export const getLatestArticleLinksFromNews24live: GetLatestArticleLinksFn =
    async (browser) => {
        const page = await browser.newPage();
        // Make sure we waitUntil `documentloaded`
        await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
        await page.setViewport({ width: 1200, height: 800 });

        // Auto scrolls down so the contents at the bottom could load before we pull all the links.
        await autoPageScroll(page);

        // Get all the links from the page
        const allLinks = await page.evaluate(() => {
            return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
        });

        const links: string[] = [];
        for (const link of allLinks) {
            if (link.startsWith(`${baseUrl}/details/`)) {
                const url = new URL(link, baseUrl)
                links.push(url.href)
            }

        }

        return Array.from(new Set(links));;
    };

export const getArticleMetadataFromNews24live: GetArticleMetadataFn =
    async (articleUrl, browser) => {
        const page = await browser.newPage();
        await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
        await page.setViewport({ width: 1080, height: 1024 });

        // On prothomalo images loads after the document gets loaded. So We need to wait for the image load too.
        const imgElement = await page.waitForSelector(".row.details_detailsArea__mM_eA .details_articleArea__t7HvD img");
        // Some extra delay to make sure the src get's applied correctly.
        await new Promise((resolve) => setTimeout(resolve, 10));

        const thumbnailUrl = await imgElement?.evaluate((el) => el.srcset);

        const metadata = await page.evaluate(() => {
            const title = document
                .querySelector(".row.details_detailsArea__mM_eA .details_articleArea__t7HvD > h1")
                ?.textContent?.trim();

            const bangladate = (
                document.querySelector(
                    ".row.details_detailsArea__mM_eA .details_articleArea__t7HvD time",
                ) as HTMLTimeElement | null
            )?.textContent?.trim().replace('আপডেট: ', '').replace('প্রকাশ: ', '').split(',').splice(1).join('').trim();

            function banglaToEnglish(text: string) {
                const map: Record<string, string> = {
                    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
                    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
                    'জানুয়ারি': 'January', 'ফেব্রুয়ারি': 'February', 'মার্চ': 'March',
                    'এপ্রিল': 'April', 'মে': 'May', 'জুন': 'June',
                    'জুলাই': 'July', 'আগস্ট': 'August', 'সেপ্টেম্বর': 'September',
                    'অক্টোবর': 'October', 'নভেম্বর': 'November', 'ডিসেম্বর': 'December'
                };
                return text.replace(/[০-৯]|জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর/g, match => map[match]);
            }
            const pubDate = bangladate ? banglaToEnglish(bangladate) : null

            // For now we can get the description from page metadata. Will use the main article content and ai to generate summery soon.
            // const content = document
            //   .querySelector(".story-content-wrapper .story-content > div:nth-child(2)")
            //   ?.textContent?.trim();

            const content = (
                document.querySelector(
                    "meta[name='description']",
                ) as HTMLMetaElement | null
            )?.content?.trim();

            return {
                title,
                content,
                pubDate,
            };
        });

        return {
            thumbnailUrl,
            title: metadata.title?.trim(),
            content: metadata.content?.trim(),
            publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
        };
    };
