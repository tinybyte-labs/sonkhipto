import { Category, Post, User } from "@acme/db";

export type PublicPost = Post & {
  _count: {
    favorites: number;
    bookmarks: number;
    views: number;
  };
  viewer: {
    bookmarked: boolean;
    favorite: boolean;
  } | null;
  author?: User | null;
  category?: Category | null;
};

export type PublicUser = User & {
  categories?: Category[];
};
