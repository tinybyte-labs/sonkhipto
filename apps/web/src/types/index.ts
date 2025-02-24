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

export interface Publisher {
  id: string;
  name: string;
  websiteUrl: string;
  getLatestArticleLinks: () => Promise<string[]>;
  getArticleMetadata: (articleUrl: string) => Promise<ArticleMetadata | null>;
}
