import { Params } from "fastify-cron";
import { newsPublishers } from "../constants/publishers";
import * as htmlparser2 from "htmlparser2";
import { Prisma, db } from "@acme/db";
import { NewsPublisher } from "../types/news-publisher";
import { getPageMetadata } from "../utils/get-page-metadata";
import { chunkArray } from "../utils";

const scrapeFeedItem = async (item: htmlparser2.DomUtils.FeedItem) => {
    if (typeof item.link !== "string") {
        console.log("Invalid Link", item.link);
        throw new Error("Invalid Link");
    }

    const sourceUrl = item.link;

    const exists = await db.post.findUnique({
        where: { sourceUrl },
    });

    if (exists) {
        throw new Error("Already scraped");
    }

    const pageMetadata = await getPageMetadata(sourceUrl);
    const title = pageMetadata?.title || item.title;
    const content = pageMetadata?.content || item.description;
    const imageUrl = pageMetadata?.imageUrl ?? item.media?.[0]?.url;

    if (!title || title.length >= 100) {
        throw new Error("Invalid title");
    }

    if (!content || content.length > 500 || content.length < 50) {
        throw new Error("Invalid content");
    }

    const newsItem = {
        title,
        content,
        sourceUrl,
        imageUrl,
    };

    return newsItem;
};

const scrapePublisherFeed = async (publisher: NewsPublisher) => {
    const res = await fetch(publisher.rssFeedUrl);
    const feedStr = await res.text();
    const feed = htmlparser2.parseFeed(feedStr);

    if (!feed) {
        throw new Error("Failed to parse feed");
    }

    console.log(`${publisher.url} - TOTAL ${feed.items.length} ITEMS`);

    const posts: Prisma.PostCreateInput[] = [];

    const chunks = chunkArray(feed.items, 30);

    for (let i = 0; i < chunks.length; i++) {
        try {
            const chunk = chunks[i];
            const results = await Promise.allSettled(chunk.map(scrapeFeedItem));
            results.forEach((result) => {
                if (result.status === "fulfilled") {
                    posts.push({
                        ...result.value,
                        language: publisher.language,
                        countryCode: publisher.countryCode,
                        sourceName: publisher.name,
                    });
                }
            });
        } catch (error: any) { }
    }
    console.log(`${publisher.url} - TOTAL ${posts.length} UNIQUE POSTS`);

    return posts;
};

const startScrapingNewsFeeds = async () => {
    console.log("NEWS FEED SCRAPE STARTED!");
    console.log(`SCRAPING TOTAL ${newsPublishers.length} NEWS PUBLISHERS`);

    try {
        const data: Prisma.PostCreateInput[] = [];

        for (let i = 0; i < newsPublishers.length; i++) {
            const publisher = newsPublishers[i];
            try {
                console.log(`${publisher.url} - SCRAPE STARTED`);
                const newPosts = await scrapePublisherFeed(publisher);
                data.push(...newPosts);
                console.log(`${publisher.url} - SCRAPE FINISHED`);
            } catch (error: any) {
                console.log(`${publisher.url} - SCRAPE ERROR`);
            }
        }
        console.log(`TOTAL ${data.length} POSTS SCRAPED`);

        await db.post.createMany({
            data: data.map((item) => ({ ...item, authorId: process.env.AUTHOR_ID })),
            skipDuplicates: true,
        });
        console.log(`ALL SCRAPED POSTS ADDED TO DB`);
        console.log("NEWS FEED SCRAPE SUCCESS!");
    } catch (error: any) {
        console.log("FAILED TO SCRAPE NEWS FEEDS", error);
    }
};

export const SCRAPE_NEWS_FEEDS_JOB_NAME = "scrape-news-feeds";

export const scrapeNewsFeedsJob: Params = {
    name: SCRAPE_NEWS_FEEDS_JOB_NAME,
    cronTime: "0 */4 * * *",
    onTick: startScrapingNewsFeeds,
};