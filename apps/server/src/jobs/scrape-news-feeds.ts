import "dotenv/config";

import { Params } from "fastify-cron";
import { newsPublishers } from "../constants/publishers";
import * as htmlparser2 from "htmlparser2";
import { db } from "@acme/db";
import { NewsPublisher } from "../types/news-publisher";
import { getPageMetadata } from "../utils/get-page-metadata";

const getUrlWithUtm = (url: string) => {
  const sourceUrl = new URL(url);
  sourceUrl.searchParams.set("utm_campaign", "fullarticle");
  sourceUrl.searchParams.set("utm_medium", "referral");
  sourceUrl.searchParams.set("utm_source", "sonkhipto");
  return sourceUrl.toString();
};

const scrapeFeedItem = async (item: htmlparser2.DomUtils.FeedItem) => {
  if (!item.link) {
    throw new Error("Invalid Link");
  }
  const pageMetadata = await getPageMetadata(item.link);
  const sourceUrl = getUrlWithUtm(item.link);
  const title = pageMetadata?.title;
  const content = pageMetadata?.content;
  if (!title || title.length >= 100) {
    throw new Error("Invalid title");
  }
  if (!content || content.length >= 500) {
    throw new Error("Invalid content");
  }

  const newsItem = {
    title,
    content,
    sourceUrl,
    imageUrl: pageMetadata?.imageUrl,
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

  const results = await Promise.allSettled(feed.items.map(scrapeFeedItem));

  return results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .map((post) => ({
      ...post,
      language: publisher.language,
      countryCode: publisher.countryCode,
      sourceName: publisher.name,
    }));
};

const startScrapingNewsFeeds = async () => {
  try {
    console.log("START NEWS FEED SCRAPE!");
    const results = await Promise.allSettled(
      newsPublishers.map(scrapePublisherFeed),
    );

    const posts = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );

    await db.post.createMany({
      data: posts,
      skipDuplicates: true,
    });

    console.log("NEWS FEED SCRAPE SUCCESS!");
  } catch (error: any) {
    console.log("FAILED TO SCRAPE NEWS FEEDS", error);
  }
};

export const SCRAPE_NEWS_FEEDS_JOB_NAME = "scrape-news-feeds";

export const scrapeNewsFeedsJob: Params = {
  name: SCRAPE_NEWS_FEEDS_JOB_NAME,
  cronTime: "0 */6 * * *",
  onTick: startScrapingNewsFeeds,
};
