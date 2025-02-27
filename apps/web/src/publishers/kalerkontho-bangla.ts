import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { Browser } from "puppeteer-core";
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

async function getCategoriwiseLink(browser: Browser, category: string) {
    const page = await browser.newPage();
    const url = new URL(category, baseUrl)
    await page.goto(url.href)

    const allLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href))

    let links = []
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
    await page.close()
    return links
}
export const getLatestArticleLinksFromKalkerKontho: GetLatestArticleLinksFn = async (browser) => {
    const links: string[] = []
    for (const category of categories) {
        const link = await getCategoriwiseLink(browser, category)
        Array.prototype.push.apply(links, link)
    }
    return links
}

export const getMetadataFromKalerKontho: GetArticleMetadataFn = async (articleLink, browser) => {
    const page = await browser.newPage();
    const url = new URL(articleLink, baseUrl)
    await page.goto(url.href)

    const metadata = await page.evaluate(() => {
        const title = document
            .querySelector('#__next > main > section > div > div > div > div:nth-child(2) > h1')
            ?.textContent?.trim();

        const pubDate = (
            document.querySelector("#__next > main > section > div > div > div > div:nth-child(2) > div:nth-child(5) > div > div > time"
            ) as HTMLTimeElement | null
        )?.textContent?.trim();

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
        publishedAt: metadata.pubDate ? new Date(metadata.pubDate.replace("Publish : ", "")) : null,
    };
}