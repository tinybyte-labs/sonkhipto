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
) => Promise<ArticleMetadata | null>;
export type GetLatestArticleLinksFn = () => Promise<string[]>;

export interface Publisher {
  id: string;
  name: string;
  websiteUrl: string;
  countryCode: string;
  language: string;
  getLatestArticleLinks: GetLatestArticleLinksFn;
  getArticleMetadata: GetArticleMetadataFn;
}
