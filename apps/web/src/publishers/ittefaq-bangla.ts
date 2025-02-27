import { type Browser } from "puppeteer-core";
const baseUrl = 'https://www.ittefaq.com.bd'

const categories = [
    'national',
    'lifestyle',
    'law-and-court',
    'opinion',
    'news',
    'environment',
    'capital',
    'country',
    'politics',
    'world-news',
    'sports',
    'entertainment',
    'business',
    'tech',
    'education',
    'health',
    'jobs',
    'social-media',
    'projonmo',
    'probash',
    'campus',
    'literature',
    'religion',
]
const skipcategory = [
    'latest-news',
    'national',
    'lifestyle',
    'law-and-court',
    'opinion',
    'news',
    'environment',
    'capital',
    'country',
    'politics',
    'world-news',
    'sports',
    'entertainment',
    'business',
    'tech',
    'education',
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
]

export async function getLatestArticleLinksFromIttefaqBangla(browser: Browser, category: string) {
    const page = await browser.newPage();
    const url = new URL(category, baseUrl)
    await page.goto(url.href)

    const allLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href))


    let links = []
    for (const link of allLinks) {
        if (!link.startsWith(`${baseUrl}/`)) {
            continue
        }
        const urlp = new URL(link, baseUrl)
        if (!skipcategory.includes(urlp.pathname.slice(1).split('/')[0])) {
            links.push(urlp.href)
        }

    }
    await page.close()
    return links
}

export async function getMetadataFromIttefaqBangla(articleLink: string, browser: Browser) {
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