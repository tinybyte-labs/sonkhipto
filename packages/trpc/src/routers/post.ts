import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = router({
  findMany: publicProcedure
    .input(
      z.object({
        language: z.enum(["bn", "en"]).optional(),
        countryCode: z.enum(["BN"]).optional(),
        limit: z.number().min(0).max(50).default(10),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input: { cursor, limit, countryCode, language } }) => {
      const posts = await ctx.db.post.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        cursor: cursor ? { id: cursor } : undefined,
        include: { author: { select: { name: true } } },
        where: {
          language,
          countryCode,
        },
      });

      let nextCursor = posts[limit - 1]?.id;

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
      })
    )
    .query(async ({ ctx, input }) => {
      const bookmarks = await ctx.db.postBookmark.findMany({
        where: { userId: ctx.user.id },
        include: { post: { include: { author: { select: { name: true } } } } },
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
});
