import type { Prisma } from "@acme/db";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";
import type { PublicPost } from "../types";

export const feedRouter = router({
  latestFeed: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async (opts) => {
      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy: [
          { publishedAt: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
          { id: "asc" },
        ],
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: {
          author: true,
          category: true,
          FavoritePost: {
            where: { userId: opts.ctx.user.id },
          },
          PostBookmark: {
            where: { userId: opts.ctx.user.id },
          },
          _count: {
            select: { FavoritePost: true, PostBookmark: true, PostView: true },
          },
        },
        where: {
          language: opts.input.language,
        },
      });

      const nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts: posts.map(({ _count, PostBookmark, FavoritePost, ...post }) => {
          return {
            ...post,
            _count: {
              bookmarks: _count.PostBookmark,
              favorites: _count.FavoritePost,
              views: _count.PostView,
            },
            viewer: {
              bookmarked: PostBookmark.length > 0,
              favorite: FavoritePost.length > 0,
            },
          } satisfies PublicPost;
        }),
      };
    }),
  trendingFeed: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async (opts) => {
      const last3Day = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy: [
          { FavoritePost: { _count: "desc" } },
          { PostBookmark: { _count: "desc" } },
          { PostView: { _count: "desc" } },
          { publishedAt: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
          { id: "asc" },
        ],
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: {
          author: true,
          category: true,
          FavoritePost: {
            where: { userId: opts.ctx.user.id },
          },
          PostBookmark: {
            where: { userId: opts.ctx.user.id },
          },
          _count: {
            select: { FavoritePost: true, PostBookmark: true, PostView: true },
          },
        },
        where: {
          language: opts.input.language,
          createdAt: {
            gte: last3Day,
          },
        },
      });

      const nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts: posts.map(({ _count, PostBookmark, FavoritePost, ...post }) => {
          return {
            ...post,
            _count: {
              bookmarks: _count.PostBookmark,
              favorites: _count.FavoritePost,
              views: _count.PostView,
            },
            viewer: {
              bookmarked: PostBookmark.length > 0,
              favorite: FavoritePost.length > 0,
            },
          } satisfies PublicPost;
        }),
      };
    }),
  myFeedV2: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async (opts) => {
      const followingCategories = await opts.ctx.db.categoryFollow.findMany({
        where: {
          userId: opts.ctx.session.id,
        },
        select: { categoryId: true },
      });

      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy: [
          { publishedAt: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
          { id: "asc" },
        ],
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: {
          author: true,
          category: true,
          FavoritePost: {
            where: { userId: opts.ctx.user.id },
          },
          PostBookmark: {
            where: { userId: opts.ctx.user.id },
          },
          _count: {
            select: { FavoritePost: true, PostBookmark: true, PostView: true },
          },
        },
        where: {
          language: opts.input.language,
          categoryId: {
            in: followingCategories.map((c) => c.categoryId),
          },
          PostView: {
            none: {
              userId: opts.ctx.user.id,
            },
          },
        },
      });

      const nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts: posts.map(({ _count, PostBookmark, FavoritePost, ...post }) => {
          return {
            ...post,
            _count: {
              bookmarks: _count.PostBookmark,
              favorites: _count.FavoritePost,
              views: _count.PostView,
            },
            viewer: {
              bookmarked: PostBookmark.length > 0,
              favorite: FavoritePost.length > 0,
            },
          } satisfies PublicPost;
        }),
      };
    }),
  myFeed: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
        feedType: z.enum(["all-posts", "my-feed", "trending"]),
      }),
    )
    .query(async (opts) => {
      let where: Prisma.PostWhereInput = {};
      let orderBy: Prisma.PostOrderByWithRelationInput[] = [
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "asc" },
      ];
      switch (opts.input.feedType) {
        case "all-posts": {
          where = {
            language: opts.input.language,
          };
          break;
        }
        case "my-feed": {
          where = {
            language: opts.input.language,
            PostView: {
              none: {
                userId: opts.ctx.user.id,
              },
            },
          };
          break;
        }
        case "trending": {
          const last3Day = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          where = {
            language: opts.input.language,
            createdAt: {
              gte: last3Day,
            },
          };
          orderBy = [
            { FavoritePost: { _count: "desc" } },
            { PostBookmark: { _count: "desc" } },
            { PostView: { _count: "desc" } },
            { publishedAt: { sort: "desc", nulls: "last" } },
            { createdAt: "desc" },
            { id: "asc" },
          ];
          break;
        }

        default:
          break;
      }

      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        orderBy,
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        include: {
          author: { select: { name: true } },
          category: true,
          FavoritePost: {
            where: { userId: opts.ctx.user.id },
          },
          PostBookmark: {
            where: { userId: opts.ctx.user.id },
          },
          _count: { select: { FavoritePost: true, PostBookmark: true } },
        },
        where: {
          ...where,
        },
      });

      const nextCursor = posts[opts.input.limit - 1]?.id;

      return {
        nextCursor,
        posts,
      };
    }),
});
