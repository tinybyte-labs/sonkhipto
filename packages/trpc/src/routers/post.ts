import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@acme/db";

export const postRouter = router({
  findMany: protectedProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(100).default(10),
        cursor: z.string().uuid().optional(),
        orderBy: z
          .enum(["createdAt", "updatedAt", "title"])
          .default("createdAt"),
        orderType: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async (opts) => {
      const orderBy: Prisma.PostOrderByWithRelationInput = {};
      orderBy[opts.input.orderBy] = opts.input.orderType;

      const posts = await opts.ctx.db.post.findMany({
        take: opts.input.limit,
        skip: opts.input.cursor ? 1 : 0,
        cursor: opts.input.cursor ? { id: opts.input.cursor } : undefined,
        orderBy,
        include: {
          author: true,
          category: true,
          _count: {
            select: { FavoritePost: true, PostBookmark: true, PostView: true },
          },
        },
      });
      let nextCursor = posts[opts.input.limit - 1]?.id;
      return {
        nextCursor,
        posts,
      };
    }),
  addBookmark: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }

      const alreadyBookmarked = await ctx.db.postBookmark.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      if (alreadyBookmarked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The post is already bookmarked by the user",
        });
      }

      const bookmark = await ctx.db.postBookmark.create({
        data: { userId: ctx.user.id, postId: post.id },
      });
      return bookmark;
    }),
  removeBookmark: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }

      const alreadyBookmarked = await ctx.db.postBookmark.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      if (!alreadyBookmarked) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No bookmark found for the post by the user",
        });
      }

      const deletedBookmark = await ctx.db.postBookmark.delete({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
      return deletedBookmark;
    }),

  addToFavorites: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }
      return ctx.db.favoritePost.create({
        data: {
          userId: ctx.user.id,
          postId: post.id,
        },
      });
    }),
  removeFromFavorites: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found!" });
      }

      return ctx.db.favoritePost.delete({
        where: { userId_postId: { userId: ctx.user.id, postId: post.id } },
      });
    }),
  getBookmarks: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await ctx.db.postBookmark.findMany({
      where: { userId: ctx.user.id },
    });
    return bookmarks;
  }),
  getBookmarksWithPost: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bookmarks = await ctx.db.postBookmark.findMany({
        where: { userId: ctx.user.id },
        include: {
          post: {
            include: {
              author: { select: { name: true } },
              FavoritePost: {
                where: { userId: ctx.user.id },
              },
              PostBookmark: {
                where: { userId: ctx.user.id },
              },
              _count: {
                select: {
                  FavoritePost: true,
                  PostBookmark: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { postId: "asc" }],
        cursor: input.cursor
          ? {
              userId_postId: {
                postId: input.cursor,
                userId: ctx.user.id,
              },
            }
          : undefined,
        take: input.limit,
        skip: input.cursor ? 1 : 0,
      });

      const nextCursor = bookmarks[input.limit - 1]?.postId;

      return {
        nextCursor,
        bookmarks,
      };
    }),
  addView: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async (opts) => {
      try {
        await opts.ctx.db.postView.create({
          data: {
            postId: opts.input.postId,
            userId: opts.ctx.user.id,
          },
        });
      } catch (error: any) {}
    }),
});
