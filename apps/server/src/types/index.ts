import { Browser } from "puppeteer-core";

export type NewsPublisher = {
  id: string;
  name: string;
  url: string;
  rssFeedUrl: string;
  countryCode: string;
  language: string;
};

export interface ArticleMetadata {
  title?: string | null;
  content?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: Date | null;
}

export type GetArticleMetadataFn = (
  articleUrl: string,
  browser: Browser,
) => Promise<ArticleMetadata | null>;
export type GetLatestArticleLinksFn = (browser: Browser) => Promise<string[]>;

export interface Publisher {
  id: string;
  name: string;
  websiteUrl: string;
  countryCode: string;
  language: string;
  getLatestArticleLinks: GetLatestArticleLinksFn;
  getArticleMetadata: GetArticleMetadataFn;
}
