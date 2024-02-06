import { NewsItem } from "./news-item";
import { WithId } from "./with-id";

export type NewsBookmark = {
  type: "news";
  id: string;
  createdAt: string;
  data: WithId<NewsItem>;
};

export type Bookmark = NewsBookmark;
