import type { NewsItem } from "./news-item";
import type { WithId } from "./with-id";

export interface NewsBookmark {
  type: "news";
  id: string;
  createdAt: string;
  data: WithId<NewsItem>;
}

export type Bookmark = NewsBookmark;
