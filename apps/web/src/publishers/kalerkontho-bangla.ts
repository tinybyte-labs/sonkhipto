import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { autoPageScroll } from "@/utils/server/puppeteer";
const baseUrl = 'https://www.kalerkantho.com'

const categories = [
    'online/national',
    'online/country-news',
    'online/dhaka',
    'online/Politics',
    'online/Court',
    'online/campus-online',
    'online/world',
    'online/sport',
    'online/entertainment',
    'online/business',
    'online/stock-market',
    'online/Islamic-lifestylie',
    'online/lifestyle',
    'online/shuvosangho',
    'online/prescription',
    'online/jobs',
    'online/miscellaneous',
    'online/corporatecorner',
    'online/travel',
    'online/info-tech',
    'online/nrb',
    'online/opinion',
    'online/sahitya',
    'online/jokes',
    'online/social-media',
]

export const getLatestArticleLinksFromKalkerKontho: GetLatestArticleLinksFn =
    async (browser) => {
        const page = await browser.newPage();
        await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
        await page.setViewport({ width: 1200, height: 800 });
        await autoPageScroll(page);

        const allLinks = await page.evaluate(() => {
            return Array.from(document.getElementsByTagName("a")).map((a) => a.href);
        });

        const links: string[] = [];
        for (const link of allLinks) {
            if (!link.startsWith(`${baseUrl}/`)) {
                continue
            }
            const url = new URL(link, baseUrl)
            if (!categories.includes(url.pathname.slice(1))) {
                for (let category of categories) {
                    if (url.pathname.slice(1).startsWith(category)) {
                        links.push(url.href)
                    }
                }
            }
        }

        return links
    }

export const getMetadataFromKalerKontho: GetArticleMetadataFn =
    async (articleLink, browser) => {
        const page = await browser.newPage();
        const url = new URL(articleLink, baseUrl)
        await page.goto(url.href)

        const metadata = await page.evaluate(() => {
            const title = document
                .querySelector('#__next > main > section > div > div > div > div:nth-child(2) > h1')
                ?.textContent?.trim();


            let banglatime = (
                document.querySelector("#__next > main > section > div > div > div > div:nth-child(2) > div:nth-child(5) > div > div > time"
                ) as HTMLTimeElement | null
            )?.textContent?.trim();

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
            const pubDate = banglatime ? banglaToEnglish(banglatime) : null

            const thumbnailUrl = (
                document.querySelector('#adf-overlay') as HTMLImageElement | null
            )?.src;

            //      const content = (
            //       document.querySelector('#widget_322 .content_detail_outer .content_detail_content_outer article > div',
            //     ) as HTMLMetaElement | null
            //   )?.textContent?.trim();

            const content = (
                document.querySelector(
                    "meta[name='description']",
                ) as HTMLMetaElement | null
            )?.content?.trim();

            return {
                title,
                thumbnailUrl,
                content,
                pubDate,
            };
        })
        return {
            title: metadata.title?.trim(),
            thumbnailUrl: metadata.thumbnailUrl,
            content: metadata.content?.trim(),
            publishedAt: metadata.pubDate ? new Date(metadata.pubDate) : null,
        };
    }