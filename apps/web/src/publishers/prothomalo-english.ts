import { GetLatestArticleLinksFn } from "@/types";
import { Browser } from "puppeteer-core"
const baseURL = 'https://en.prothomalo.com'

const categories = [
    // bangladesh
    'bangladesh',
    'bangladesh/politics',
    'bangladesh/accident',
    'bangladesh/good-day-bangladesh',
    'bangladesh/crime-and-law',
    'bangladesh/government',
    'bangladesh/city',
    'bangladesh/local-news',
    'bangladesh/parliament',
    'bangladesh/bangladesh-in-world-media',
    'bangladesh/roundtable',

    // international
    'international',
    'international/asia',
    'international/europe',
    'international/americas',
    'international/middle-east',
    'international/india',
    'international/china',
    'international/africa',
    'international/australia',
    'international/south-asia',

    // sports
    'sports',
    'sports/cricket',
    'sports/football',
    'sports/local-sports',

    // business,
    'business',
    'business/local',
    'business/global',
    'topic/national-budget-2024-25',

    // opinion
    'opinion',
    'opinion/editorial',
    'opinion/interview',
    'opinion/op-ed',

    // youth
    'youth',
    'youth/education',
    'youth/employment',

    // entertainment
    'entertainment',
    'entertainment/music',
    'entertainment/movies',
    'entertainment/television',
    'entertainment/ott',

    // lifestyle
    'lifestyle',
    'lifestyle/fashion',
    'lifestyle/health',
    'lifestyle/beauty',
    'lifestyle/travel',

    // environment
    'environment',
    'environment/climate-change',
    'environment/pollution',

    // science-technology
    'science-technology',
    'science-technology/gadgets',
    'science-technology/social-media',
    'science-technology/it',
    'science-technology/science',

    // corporate   
    'corporate',
    'corporate/local',
    'corporate/global'

]



async function getLinksFromCategory(browser: Browser, category: string) {
    const page = await browser.newPage();
    const url = `${baseURL}/${category}`
    await page.goto(url)
    const allLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href))

    let categorizedlink = allLinks.filter(l => l.startsWith(`${url}/`))

    let links = []
    for (const link of categorizedlink) {
        const urlp = new URL(link, baseURL)
        if (!categories.includes(decodeURIComponent(urlp.pathname).slice(1))) {
            links.push(urlp.href)
        }
    }

    return { category, links: Array.from(new Set(links)), total: links.length };
}
export const getLatestArticleLinksFromPrathamAloEnglish: GetLatestArticleLinksFn =
    async (browser) => {
        const topLevelCategories = categories.filter((c) => !c.includes("/"));

        let links = [];
        for (const category of topLevelCategories) {
            const l = await getLinksFromCategory(browser, category);
            links.push(l);
        }
        return links.flatMap((link) => link.links);
    };

export async function getArticleMetadataFromProthomAloEnglish(articleLink: string, browser: Browser) {
    const page = await browser.newPage();
    const url = new URL(articleLink, baseURL)
    await page.goto(url.href)

    const metadata = await page.evaluate(() => {
        const title = document
            .querySelector(".story-content-wrapper > div > .story-head h1")
            ?.textContent?.trim();

        const pubDate = (
            document.querySelector(
                ".story-content-wrapper > div > .story-head .story-metadata-wrapper time",
            ) as HTMLTimeElement | null
        )?.dateTime;

        const thumbnailUrl = (
            document.querySelector(
                ".story-content-wrapper .story-content img",
            ) as HTMLImageElement | null
        )?.src;

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