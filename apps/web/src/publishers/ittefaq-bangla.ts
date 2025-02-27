import { GetArticleMetadataFn, GetLatestArticleLinksFn } from "@/types";
import { type Browser } from "puppeteer-core";
const baseUrl = 'https://www.ittefaq.com.bd'


const categories = [
    'national',
    'politics',
    'country',
    'capital',
    'sports',
    'business',
    'opinion',
    'entertainment',
    'law-and-court',
    'education',
    'latest-news',
    'lifestyle',
    'news',
    'environment',
    'world-news',
    'tech',
    'health',
    'jobs',
    'social-media',
    'projonmo',
    'probash',
    'campus',
    'literature',
    'religion',
    'editorial',
    'photo',
    'video',
    '',
    'home',
    'unicode-to-bijoy-converter',
    'archive',
    'search',
    'contact',
    'privacy-policy',
    'terms',
    'topic',
    'advertisement',
    'asia',
    'middle-east',
    'America',
    'europe',
    'africa',
    'oceania',
    'cricket',
    'football',
    'column',
    'letter',
    'reaction',
    'interview',
    'memoir',
    'other-sports',
]

async function getCategoriwiseLinkFromIttefaq(browser: Browser, category: string) {
    const page = await browser.newPage();
    const url = new URL(category, baseUrl)
    await page.goto(url.href)

    const allLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href))

    let links: string[] = []
    for (const link of allLinks) {
        if (link.startsWith(`${baseUrl}/`)) {
            const url = new URL(link, baseUrl)
            if (!categories.includes(url.pathname.slice(1).split('/')[0])) {
                links.push(url.href)
            }
        }
    }
    await page.close()
    return links
}


export const getLatestArticleLinksFromIttefaqBangla: GetLatestArticleLinksFn = async (browser) => {
    const links: string[] = []
    for (const category of categories) {
        const link = await getCategoriwiseLinkFromIttefaq(browser, category)
        Array.prototype.push.apply(links, link)
    }
    return links
}

export const getMetadataFromIttefaqBangla: GetArticleMetadataFn = async (articleLink, browser) => {
    const page = await browser.newPage();
    const url = new URL(articleLink, baseUrl)
    await page.goto(url.href)

    const metadata = await page.evaluate(() => {
        const title = document
            .querySelector(".content_detail_outer > .content_detail_inner > .content_detail_left > div > div > div:nth-child(1) > div > h1")
            ?.textContent?.trim();

        const pubDate = (
            document.querySelector(".content_detail_outer .content_detail_left .additional_info_container .each_row.time > span"
            ) as HTMLTimeElement | null
        )?.textContent?.trim();

        const thumbnailUrl = (
            document.querySelector(
                ".content_detail_outer .content_detail_left .row.detail_holder .featured_image img",
            ) as HTMLImageElement | null
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